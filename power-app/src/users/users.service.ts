import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
import { User, UserRole } from '../entities/user.entity';
import { UserResponse } from '../dtos/responses/user_response.dto';
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
        res: Response
    ) {
        try {
            const users = await this.usersRepository.find();
            res.status(200).send(users);
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
            res.status(200).send(user);
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

            const userResponse = new UserResponse(newUser);

            const accessToken = await this.authService.generateJwtToken(newUser.id);
            userResponse.addAccessToken(accessToken);

            res.status(201).send(userResponse);
        }
    }

    async loginUser(
        loginUserDto: LoginUserDto, 
        res: Response
    ) {
        const authenticatedUser = await this.authService.authenticateUser(loginUserDto);

        if (authenticatedUser) {
                const userResponse = new UserResponse(authenticatedUser);

                const accessToken = await this.authService.generateJwtToken(authenticatedUser.id);
                userResponse.addAccessToken(accessToken);

                res.status(201).send(userResponse);
        } else {
            const authenticatedTempUser = await this.authService.authenticateTemporaryPassword(loginUserDto);
            
            if (authenticatedTempUser) {
                const userResponse = new UserResponse(authenticatedTempUser);

                const accessToken = await this.authService.generateJwtToken(authenticatedTempUser.id);
                userResponse.addAccessToken(accessToken);

                res.status(201).send(userResponse);
            } else {
                res.status(401).send({ error: 'Credenciales inválidas' });
            }
        }
    }
}