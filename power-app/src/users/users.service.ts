import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
import { GetUsersQueryDto } from '../dtos/user/get_users_query.dto';
import { User, UserRole } from '../entities/user.entity';
import { AuthService } from '../authentication/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private authService: AuthService
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
        const userEmailActivo = await this.usersRepository.findOne( { 
            where: { email: createUserDto.email }
        });
        
        if (userEmailActivo) {
            res.status(409).send({ error: 'Ya existe un usuario con ese email' });
        } else {
            const hashedPassword = await this.authService.hashPassword(createUserDto.password);

            const newUser = this.usersRepository.create(createUserDto);

            newUser.password = hashedPassword;

            await this.usersRepository.save(newUser);

            const accessToken = await this.authService.generateJwtToken(newUser.id);
            res.setHeader('Authorization', `Bearer ${accessToken}`);

            res.status(201).send(instanceToPlain(newUser));
        }
    }

    async loginUser(
        loginUserDto: LoginUserDto, 
        res: Response
    ) {
        const authenticatedUser = await this.authService.authenticateUser(loginUserDto);

        if (authenticatedUser) {
            const accessToken = await this.authService.generateJwtToken(authenticatedUser.id);
            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.status(200).send(instanceToPlain(authenticatedUser));
        } else {
            const authenticatedTempUser = await this.authService.authenticateTemporaryPassword(loginUserDto);

            if (authenticatedTempUser) {
                const accessToken = await this.authService.generateJwtToken(authenticatedTempUser.id);
                res.setHeader('Authorization', `Bearer ${accessToken}`);
                res.status(200).send(instanceToPlain(authenticatedTempUser));
            } else {
                res.status(401).send({ error: 'Credenciales inválidas' });
            }
        }
    }
}