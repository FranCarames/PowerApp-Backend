import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateEstudianteDto } from 'src/Dtos/Estudiantes/create_estudiante.dto';
// import { EditEstudianteDto } from 'src/Dtos/Estudiantes/edit_estudiante.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
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
}




// @Injectable()
// export class SqlEstudianteService {

    

    

//     async getEstudianteId(
//         idEstudiante: number,
//         res: Response
//     ) {
//         try {
//             const estudiante = await this.estudiantesRepository.findOne({ where: { id: idEstudiante } });
            
//             if (!estudiante) {
//                 return res.status(404).send({ error: 'Estudiante no encontrado' });
//             }
//             res.status(200).send(estudiante);
//         } catch (error) {
//             console.error(error);
//             res.status(404).send({ error: 'Error al obtener el estudiante' });
//         }
//     }

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

//     async createEstudiante(
//         createEstudianteDto: CreateEstudianteDto,
//         res: Response
//     ) {
//         const estudianteMatriculaActiva = await this.estudiantesRepository.findOne( { 
//             where: { matricula: createEstudianteDto.matricula }
//         });

//         const estudianteEmailActiva = await this.estudiantesRepository.findOne( { 
//             where: { email: createEstudianteDto.email }
//         });

//         if (estudianteMatriculaActiva) {
//             res.status(409).send({ error: 'Ya existe un estudiante con esa matrícula' });
//         } else if (estudianteEmailActiva) {
//             res.status(409).send({ error: 'Ya existe un estudiante con ese email' });
//         } else {
//             const newEstudiante = this.estudiantesRepository.create(createEstudianteDto);

//             newEstudiante.fecha_inscripcion = createEstudianteDto.fecha_inscripcion || new Date();

//             await this.estudiantesRepository.save(newEstudiante);

//             res.status(201).send(newEstudiante);
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