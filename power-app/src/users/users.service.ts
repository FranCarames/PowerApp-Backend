import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/user/create_user.dto';
import { LoginUserDto } from '../dtos/user/login_user.dto';
// import { EditEstudianteDto } from 'src/Dtos/Estudiantes/edit_estudiante.dto';
import { User } from '../entities/user.entity';
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

            // const userResponse = new UserResponse(user);

            // res.status(200).send(userResponse);

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




// @Injectable()
// export class SqlEstudianteService {

    

//     async getEstudianteIdReservas(
//         idEstudiante: number,
//         res: Response
//     ) {
//         try {
//             const estudiante = await this.estudiantesRepository.findOne({
//                 where: { id: idEstudiante },
//                 relations: ['reservas', 'reservas.libro'],
//                 select: {
//                     id: true,
//                     nombre: true,
//                     apellido: true,
//                     email: true,
//                     matricula: true,
//                     carrera: true,
//                     fecha_inscripcion: true,
//                     reservas: {
//                         id: true,
//                         fecha_inicio: true,
//                         fecha_fin: true,
//                         fecha_devolucion: true,
//                         libro: { id: true, nombre: true, nombre_autor: true, apellido_autor: true, fecha_publicacion: true }
//                     },
//                 },
//             });

//             if (!estudiante) {
//                 return res.status(404).send({ error: 'Estudiante no encontrado' });
//             }
//             res.status(200).send(estudiante);
//         } catch (error) {
//             console.error(error);
//             res.status(404).send({ error: 'Error al obtener las reservas del estudiante' });
//         }
//     }

    

//     async editEstudiante(
//         editEstudianteDto: EditEstudianteDto,
//         res: Response
//     ) {
//         const editedEstudiante = await this.estudiantesRepository.findOne({ 
//             where: { id: editEstudianteDto.id } 
//         });

//         if (!editedEstudiante) {
//             return res.status(404).send({ error: 'Estudiante no encontrado' });
//         } else {
//             // Actualizar los campos del estudiante
//             editedEstudiante.nombre = editEstudianteDto.nombre || editedEstudiante.nombre;
//             editedEstudiante.apellido = editEstudianteDto.apellido || editedEstudiante.apellido;
//             editedEstudiante.carrera = editEstudianteDto.carrera || editedEstudiante.carrera;

//             await this.estudiantesRepository.save(editedEstudiante);
            
//             res.status(200).send(editedEstudiante);
//         }
//     }

//     async deleteEstudiante(
//         idEstudiante: number,
//         res: Response
//     ) {
//         const estudiante = await this.estudiantesRepository.findOne({ where: { id: idEstudiante } });

//         if (!estudiante) {
//             return res.status(404).send({ error: 'Estudiante no encontrado' });
//         }

//         await this.estudiantesRepository.remove(estudiante);

//         res.status(200).send({ message: 'Estudiante eliminado correctamente' });
//     }
// }