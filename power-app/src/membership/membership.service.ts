import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { MembershipPayment } from '../entities/membership_payment.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateMembershipDto } from '../dtos/membership/create_membership.dto';
import { EditMembershipDto } from '../dtos/membership/edit_membership.dto';
import { RegisterMembershipPaymentDto } from '../dtos/membership/register_membership_payment.dto';
import { SetMembershipActiveDto } from '../dtos/membership/set_membership_active.dto';
import { MembershipStatus } from '../dtos/membership/membership_status.enum';
import { MembershipStatusQueryDto } from '../dtos/membership/membership_status_query.dto';
import { MembershipTypeQueryDto } from '../dtos/membership/membership_type_query.dto';
import { StudentMembershipDto, MembershipTypeGroupDto } from '../dtos/membership/membership_status_responses.dto';
import { ConfigService } from '@nestjs/config';

/** Ventana de aviso por defecto, en días, si no se configura `MEMBERSHIP_EXPIRING_SOON_DAYS`. */
const DEFAULT_EXPIRING_SOON_DAYS = 7;

@Injectable()
export class MembershipService {
    /** Cuántos días antes del vencimiento se considera una membresía "por vencer". */
    private readonly expiringSoonDays: number;

    constructor(
        @InjectRepository(Membership)
        private membershipRepository: Repository<Membership>,
        @InjectRepository(MembershipPayment)
        private membershipPaymentRepository: Repository<MembershipPayment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService,
    ) {
        this.expiringSoonDays = this.resolveExpiringSoonDays();

        const cron = require('node-cron');

        cron.schedule('00 3 * * *', () => { // Every day at 03:00:00 of Arg (UTC-3), 00:00 UTC-0
            this.updateFinishedMembershipPayments();
            console.log('Updated finished membership payments');
        });
    }

    async getAllMemberships(
        res: Response
    ) {
        try {
            const memberships = await this.membershipRepository.find();
            res.status(200).send(memberships);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener las membresías' });
        }
    }

    async getMembershipById(
        idMembership: string,
        res: Response
    ) {
        try {
            const membership = await this.membershipRepository.findOne({ where: { id: idMembership } });
            
            if (!membership) {
                return res.status(404).send({ error: 'Membresía no encontrada' });
            }
            res.status(200).send(membership);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener la membresía' });
        }
    }

    async createMembership(
        createMembershipDto: CreateMembershipDto,
        res: Response
    ) {
        try {
            const membership = await this.membershipRepository.findOne({ where: { duration: createMembershipDto.duration } });

            if (membership) {
                return res.status(400).send({ error: 'Ya existe una membresía con esa duración' });
            }

            const newMembership = this.membershipRepository.create(createMembershipDto);
            const savedMembership = await this.membershipRepository.save(newMembership);
            res.status(201).send(savedMembership);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear la membresía' });
        }
    }

    async editMembership(
        idMembership: string,
        editMembershipDto: EditMembershipDto,
        res: Response
    ) {
        try {
            const membership = await this.membershipRepository.findOne({ where: { id: idMembership } });
            if (!membership) {
                return res.status(404).send({ error: 'Membresía no encontrada' });
            }

            membership.name = editMembershipDto.name;
            membership.duration = editMembershipDto.duration;
            membership.price = editMembershipDto.price;
            membership.updated_at = new Date();
                
            const savedMembership = await this.membershipRepository.save(membership);
            res.status(201).send(savedMembership);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al editar la membresía' });
        }
    }
    
    async setMembershipActive(
        idMembership: string,
        setMembershipActiveDto: SetMembershipActiveDto,
        res: Response
    ) {
        try {
            const membership = await this.membershipRepository.findOne({ where: { id: idMembership } });
            if (!membership) {
                return res.status(404).send({ error: 'Membresía no encontrada' });
            }

            membership.active = setMembershipActiveDto.active;
            membership.updated_at = new Date();

            const savedMembership = await this.membershipRepository.save(membership);
            res.status(200).send(savedMembership);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al actualizar el estado de la membresía' });
        }
    }

    async getUserMembershipPayments(
        idUser: string,
        res: Response
    ) {
        try {
            const user = await this.userRepository.findOne({ 
                where: { id: idUser }, relations: ['userMembershipPayments'] });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            res.status(200).send(user.userMembershipPayments);
        } catch (error) {
            console.error(error);
            res.status(404).send({ error: 'Error al obtener las membresías del usuario' });
        }
    }

    async registerMembershipPayment(
        registerMembershipPaymentDto: RegisterMembershipPaymentDto,
        res: Response
    ) {
        try {
            const user = await this.userRepository.findOne({ where: { id: registerMembershipPaymentDto.user_id } });

            if (!user) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            const membership = await this.membershipRepository.findOne({ where: { id: registerMembershipPaymentDto.membership_id } });

            if (!membership) {
                return res.status(400).send({ error: 'Membresía no encontrada' });
            }

            const newMembershipPayment = this.membershipPaymentRepository.create({
                user_id: registerMembershipPaymentDto.user_id,
                membership_id: registerMembershipPaymentDto.membership_id,
                name: membership.name,
                duration: membership.duration,
                price: membership.price,
                expired_at: this.calculateExpirationDate(membership.duration),
            })

            const savedMembershipPayment = await this.membershipPaymentRepository.save(newMembershipPayment);
            res.status(201).send(savedMembershipPayment);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al crear el pago de la membresía' });
        }
    }

    /**
     * Lee la ventana de aviso de la config (`MEMBERSHIP_EXPIRING_SOON_DAYS`).
     * Si falta o es inválida, cae al default y avisa por consola en vez de romper el arranque.
     */
    private resolveExpiringSoonDays(): number {
        const raw = this.configService.get<string>('MEMBERSHIP_EXPIRING_SOON_DAYS');

        if (raw === undefined || raw === null || raw === '') {
            return DEFAULT_EXPIRING_SOON_DAYS;
        }

        const parsed = Number(raw);

        if (!Number.isInteger(parsed) || parsed < 0) {
            console.warn(
                `MEMBERSHIP_EXPIRING_SOON_DAYS="${raw}" no es un entero >= 0; se usa el default (${DEFAULT_EXPIRING_SOON_DAYS} días).`
            );
            return DEFAULT_EXPIRING_SOON_DAYS;
        }

        return parsed;
    }

    /**
     * Deriva el estado de la membresía comparando el vencimiento contra la fecha actual.
     * La spec pide explícitamente derivarlo de `expired_at` y NO del flag `active` del pago,
     * que sólo se actualiza una vez por día con el cron y puede estar desfasado.
     */
    private classifyMembershipStatus(latestPayment: MembershipPayment | null, now: Date): MembershipStatus {
        if (!latestPayment) {
            return MembershipStatus.no_payments;
        }

        const expiredAt = new Date(latestPayment.expired_at);

        if (expiredAt.getTime() < now.getTime()) {
            return MembershipStatus.expired;
        }

        // Los vencimientos se persisten al final del día (ver `calculateExpirationDate`),
        // así que la ventana también se corta al final del día N: si no, una membresía que
        // vence justo dentro de N días quedaría como "activa" por unas horas de diferencia.
        const threshold = new Date(now);
        threshold.setDate(threshold.getDate() + this.expiringSoonDays);
        threshold.setHours(23, 59, 59, 999);

        return expiredAt.getTime() <= threshold.getTime()
            ? MembershipStatus.expiring_soon
            : MembershipStatus.active;
    }

    /** De todos los pagos de un alumno, el de vencimiento más lejano es el que manda. */
    private getLatestPayment(payments: MembershipPayment[]): MembershipPayment | null {
        if (!payments || payments.length === 0) {
            return null;
        }

        return payments.reduce((latest, current) =>
            new Date(current.expired_at).getTime() > new Date(latest.expired_at).getTime() ? current : latest
        );
    }

    /**
     * Trae a los alumnos (rol `user`) con su último pago ya resuelto y su estado derivado.
     * Se resuelve en memoria a propósito: el volumen es de escala gimnasio y evita depender
     * de un DISTINCT ON, que es específico de PostgreSQL y más frágil de mantener.
     */
    private async getStudentsWithMembershipStatus(): Promise<StudentMembershipDto[]> {
        const now = new Date();

        const students = await this.userRepository.find({
            where: { role: UserRole.user },
            relations: ['userMembershipPayments', 'userMembershipPayments.membership'],
            order: { last_name: 'ASC', first_name: 'ASC' },
        });

        return students.map(student => {
            const latestPayment = this.getLatestPayment(student.userMembershipPayments);

            return {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                membership_status: this.classifyMembershipStatus(latestPayment, now),
                expired_at: latestPayment ? latestPayment.expired_at : null,
                membership_name: latestPayment ? latestPayment.name : null,
                membership_id: latestPayment ? latestPayment.membership_id : null,
            };
        });
    }

    // CU-E-26 — Obtener estado de membresías
    async getMembershipStatusSummary(
        res: Response
    ) {
        try {
            const students = await this.getStudentsWithMembershipStatus();

            const counts = {
                active: 0,
                expiring_soon: 0,
                expired: 0,
                no_payments: 0,
            };

            for (const student of students) {
                counts[student.membership_status]++;
            }

            res.status(200).send({
                counts,
                total_students: students.length,
                expiring_soon_days: this.expiringSoonDays,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener el estado de las membresías' });
        }
    }

    // CU-E-27 — Obtener alumnos por estado de membresía
    async getStudentsByMembershipStatus(
        query: MembershipStatusQueryDto,
        res: Response
    ) {
        try {
            const students = await this.getStudentsWithMembershipStatus();
            const filtered = students.filter(student => student.membership_status === query.status);

            res.status(200).send({
                status: query.status,
                total: filtered.length,
                expiring_soon_days: this.expiringSoonDays,
                students: filtered,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los alumnos por estado de membresía' });
        }
    }

    // CU-E-28 — Obtener alumnos por tipo de membresía
    async getStudentsByMembershipType(
        query: MembershipTypeQueryDto,
        res: Response
    ) {
        try {
            if (query.membership_id) {
                const membership = await this.membershipRepository.findOne({ where: { id: query.membership_id } });

                if (!membership) {
                    return res.status(404).send({ error: 'Membresía no encontrada' });
                }
            }

            const students = await this.getStudentsWithMembershipStatus();

            // El tipo sale del último pago; los alumnos sin pagos no entran en ningún grupo.
            const withPayments = students.filter(student => student.membership_id !== null);

            if (query.membership_id) {
                const filtered = withPayments.filter(student => student.membership_id === query.membership_id);

                return res.status(200).send({
                    total: filtered.length,
                    students: filtered,
                });
            }

            const groupsByMembership = new Map<string, MembershipTypeGroupDto>();

            for (const student of withPayments) {
                const key = student.membership_id as string;

                if (!groupsByMembership.has(key)) {
                    groupsByMembership.set(key, {
                        membership_id: key,
                        membership_name: student.membership_name as string,
                        total: 0,
                        students: [],
                    });
                }

                const group = groupsByMembership.get(key)!;
                group.students.push(student);
                group.total++;
            }

            res.status(200).send({
                total_students: withPayments.length,
                without_payments: students.length - withPayments.length,
                groups: Array.from(groupsByMembership.values()),
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Error al obtener los alumnos por tipo de membresía' });
        }
    }

    private calculateExpirationDate(durationInDays: number): Date {
        const expiration = new Date();                    // fecha actual
        expiration.setDate(expiration.getDate() + durationInDays);
    
        // Forzar fin del día
        expiration.setHours(23, 59, 59, 999);
    
        return expiration;
    }

    async updateFinishedMembershipPayments() {
        const currentDate = new Date();

        await this.membershipPaymentRepository.update(
            { active: true, expired_at: LessThanOrEqual(currentDate) },
            { active: false }
        );
    }
}