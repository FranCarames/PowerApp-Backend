import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
import { GetUsersQueryDto } from '../dtos/user/get_users_query.dto';
import { SetUserActiveDto } from '../dtos/user/set_user_active.dto';
import { RecoverPasswordDto } from '../dtos/user/recover_password.dto';
import { ChangePasswordDto } from '../dtos/user/change_password.dto';
import { EditUserDto } from '../dtos/user/edit_user.dto';
import { User, UserRole } from '../entities/user.entity';
import { AuthService } from '../authentication/auth.service';
import { AuthUser } from '../authentication/auth-user.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private authService: AuthService,
        private configService: ConfigService
    ) {
    }

    async getAllUsers(
        query: GetUsersQueryDto,
        res: Response
    ) {
        try {
            const page = query.page ?? 1;
            const limit = query.limit ?? 20;

            const qb = this.usersRepository.createQueryBuilder('user');

            if (query.role) {
                qb.andWhere('user.role = :role', { role: query.role });
            }

            if (query.active !== undefined) {
                qb.andWhere('user.active = :active', { active: query.active });
            }

            if (query.keyword) {
                qb.andWhere(
                    "(user.first_name ILIKE :kw OR user.last_name ILIKE :kw OR (user.first_name || ' ' || user.last_name) ILIKE :kw OR user.email ILIKE :kw)",
                    { kw: `%${query.keyword}%` },
                );
            }

            qb.orderBy('user.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            const [users, total] = await qb.getManyAndCount();

            res.status(200).send({
                data: instanceToPlain(users),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los usuarios' });
        }
    }

    async _getUserById(idUser: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: idUser } });
    }

    async updateUserRole(idUser: string, newRole: UserRole): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { id: idUser } });

        if (user) {
            user.role = newRole;
            return await this.usersRepository.save(user);
        } else {
            return null;
        }
    }

    async getUserId(
        idUser: string,
        res: Response
    ) {
        try {
            const user = await this.usersRepository.findOne({ where: { id: idUser } });
            
            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            res.status(200).send(instanceToPlain(user));
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener el usuario' });
        }
    }

    async createUser(
        createUserDto: CreateUserDto,
        res: Response
    ) {
        try {
            const userEmailActivo = await this.usersRepository.findOne( {
                where: { email: createUserDto.email }
            });

            if (userEmailActivo) {
                res.status(409).send({ error: 'Ya existe un usuario con ese email' });
            } else {
                const hashedPassword = await this.authService.hashPassword(createUserDto.password);

                // Se fuerza el rol aunque el DTO ya lo valide: el registro nunca crea coaches ni admins.
                const newUser = this.usersRepository.create({ ...createUserDto, role: UserRole.user });

                newUser.password = hashedPassword;

                await this.usersRepository.save(newUser);

                const accessToken = await this.authService.generateJwtToken(newUser.id);
                res.setHeader('Authorization', `Bearer ${accessToken}`);

                res.status(201).send(instanceToPlain(newUser));
            }
        } catch (error) {
            // CU-U-01, error de persistencia: se informa y la cuenta no queda creada.
            console.error(error);
            res.status(500).send({ error: 'Error al registrar el usuario' });
        }
    }

    // CU-U-02 — Login
    async loginUser(
        loginUserDto: LoginUserDto,
        res: Response
    ) {
        // Primero la contraseña normal; si no coincide, la temporal (CU-U-04). Entrar con la
        // temporal obliga a cambiarla (paso 3): se informa con `password_change_required` y el
        // cliente es quien bloquea la navegación hasta el cambio (decisión del 16/10).
        try {
            let authenticatedUser = await this.authService.authenticateUser(loginUserDto);
            let passwordChangeRequired = false;

            if (!authenticatedUser) {
                authenticatedUser = await this.authService.authenticateTemporaryPassword(loginUserDto);
                passwordChangeRequired = authenticatedUser !== null;
            }

            if (!authenticatedUser) {
                return res.status(401).send({ error: 'Credenciales inválidas' });
            }

            if (!authenticatedUser.active) {
                return res.status(403).send({ error: 'La cuenta está cerrada' });
            }

            const accessToken = await this.authService.generateJwtToken(authenticatedUser.id);
            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.status(200).send({
                ...instanceToPlain(authenticatedUser),
                password_change_required: passwordChangeRequired,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al iniciar sesión' });
        }
    }

    // CU-E-03 — Cerrar (o reactivar) la cuenta de un alumno
    async setUserActive(
        currentUser: AuthUser,
        idUser: string,
        setUserActiveDto: SetUserActiveDto,
        res: Response
    ) {
        try {
            // Nadie cambia el estado de su propia cuenta: un admin podría quedarse afuera.
            if (currentUser.id.toLowerCase() === idUser.toLowerCase()) {
                return res.status(403).send({ error: 'No podés cambiar el estado de tu propia cuenta.' });
            }

            const user = await this.usersRepository.findOne({ where: { id: idUser } });
            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            // El coach sólo gestiona alumnos (cerrar y reactivar); el admin, cualquier cuenta.
            if (currentUser.role === UserRole.coach && user.role !== UserRole.user) {
                return res.status(403).send({ error: 'Un entrenador sólo puede cerrar o reactivar cuentas de alumnos.' });
            }

            user.active = setUserActiveDto.active;

            const savedUser = await this.usersRepository.save(user);
            res.status(200).send(instanceToPlain(savedUser));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la cuenta' });
        }
    }

    // CU-U-03 — Cerrar sesión
    async logout(res: Response) {
        // El token es JWT stateless: el logout efectivo lo hace el cliente descartando el token.
        // El servidor solo confirma; un token vencido tampoco es un error acá (camino alternativo del CU).
        res.status(200).send({ message: 'Sesión cerrada correctamente' });
    }

    // CU-U-04 — Recuperar contraseña
    async recoverPassword(
        recoverPasswordDto: RecoverPasswordDto,
        res: Response
    ) {
        try {
            const { email } = recoverPasswordDto;
            const user = await this.usersRepository.findOne({ where: { email } });

            if (user) {
                const tempPassword = this.authService.generateRandomPassword();
                user.temp_password = await this.authService.hashPassword(tempPassword);
                await this.usersRepository.save(user);

                // Hasta el mail real (BE-29) la temporal sólo se ve en la consola, y sólo con
                // LOG_TEMP_PASSWORD=true (local, para probar CU-U-04). En Render no se loguea.
                if (this.configService.get<string>('LOG_TEMP_PASSWORD') === 'true') {
                    console.log(`[EMAIL STUB] Contraseña temporal para ${email}: ${tempPassword}`);
                }
            }

            // Por seguridad, misma respuesta exista o no el email (no revelar si está registrado).
            return res.status(200).send({
                message: 'Si el email está registrado, te enviamos una contraseña temporal.',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'No se pudo procesar la recuperación de contraseña. Intentá de nuevo.' });
        }
    }

    // CU-U-05 — Cambiar contraseña
    async changePassword(
        currentUserId: string,
        changePasswordDto: ChangePasswordDto,
        res: Response
    ) {
        try {
            const { current_password, new_password } = changePasswordDto;

            const user = await this.usersRepository.findOne({ where: { id: currentUserId } });
            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            // La sesión puede haberse iniciado con la contraseña normal o con la temporal:
            // cualquiera de las dos habilita el cambio.
            const matchesPassword = await this.authService.comparePassword(current_password, user.password);
            const matchesTempPassword = matchesPassword
                ? false
                : await this.authService.comparePassword(current_password, user.temp_password);

            if (!matchesPassword && !matchesTempPassword) {
                return res.status(401).send({ error: 'La contraseña actual es incorrecta' });
            }

            user.password = await this.authService.hashPassword(new_password);
            // La temporal queda anulada siempre: una vez cambiada la contraseña deja de ser válida.
            user.temp_password = null;

            await this.usersRepository.save(user);

            res.status(200).send({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al cambiar la contraseña' });
        }
    }

    // CU-U-06 — Editar datos personales
    async editUser(
        currentUserId: string,
        editUserDto: EditUserDto,
        res: Response
    ) {
        try {
            const user = await this.usersRepository.findOne({ where: { id: currentUserId } });
            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            if (editUserDto.email !== undefined && editUserDto.email !== user.email) {
                const emailTaken = await this.usersRepository.findOne({ where: { email: editUserDto.email } });
                if (emailTaken) {
                    return res.status(409).send({ error: 'Ya existe un usuario con ese email' });
                }
                user.email = editUserDto.email;
                // El email nuevo arranca sin verificar.
                user.email_verified = false;
            }

            const phonePrefix = editUserDto.phone_prefix ?? user.phone_prefix;
            const phoneNumber = editUserDto.phone_number ?? user.phone_number;
            if (phonePrefix !== user.phone_prefix || phoneNumber !== user.phone_number) {
                user.phone_prefix = phonePrefix;
                user.phone_number = phoneNumber;
                // Igual que el email: si cambia el teléfono, se pierde la verificación.
                user.phone_verified = false;
            }

            if (editUserDto.first_name !== undefined) {
                user.first_name = editUserDto.first_name;
            }
            if (editUserDto.last_name !== undefined) {
                user.last_name = editUserDto.last_name;
            }
            if (editUserDto.profile_picture !== undefined) {
                user.profile_picture = editUserDto.profile_picture;
            }

            const savedUser = await this.usersRepository.save(user);
            res.status(200).send(instanceToPlain(savedUser));
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al editar los datos personales' });
        }
    }
}
