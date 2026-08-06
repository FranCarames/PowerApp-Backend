import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { MembershipPayment } from '../entities/membership_payment.entity';
import { User } from '../entities/user.entity';
import { CreateMembershipDto } from '../dtos/membership/create_membership.dto';
import { EditMembershipDto } from '../dtos/membership/edit_membership.dto';
import { RegisterMembershipPaymentDto } from '../dtos/membership/register_membership_payment.dto';
import { SetMembershipActiveDto } from '../dtos/membership/set_membership_active.dto';

@Injectable()
export class MembershipService {
    constructor(
        @InjectRepository(Membership)
        private membershipRepository: Repository<Membership>,
        @InjectRepository(MembershipPayment)
        private membershipPaymentRepository: Repository<MembershipPayment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
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