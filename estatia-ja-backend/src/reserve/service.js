import { prisma } from '../database.js';
import Reserve from './model.js';

const reserveService = {
    async createReserve(propertyId, userId, validatedData) {
        const { dateStart, dateEnd } = validatedData;
        console.log('Datas Recebidas:', { dateStart, dateEnd });

        if(new Date(dateStart) < new Date()){
            throw new error("A data de início não pode ser no passado.");
        }

        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if(!property) {
            throw new Error("Imóvel não existe");
        }

        if(property.userId === userId){
            throw new Error("Você não pode reservar seu própio imóvel.");
        }

        const existingReserve = await prisma.reserve.findFirst({
            where: {
                propertyId: propertyId,
                status: { not: 'CANCELADA' },
                AND: [
                    { dateStart: { lt: dateEnd } },
                    { dateEnd: { gt: dateStart } }
                ]
            }
        });

        if(existingReserve){
            throw new Error("O imóvel já está reservado para estas datas");
        }

        const newReserve = await prisma.reserve.create({
            data:{
                propertyId,
                userId,
                dateStart,
                dateEnd,
                status: 'CONFIRMADA'
            },
            include: {
                property: {select: { id: true, type: true, description: true, dailyRate: true } },
                user: { select: { id: true, name: true } }
            }
        });

        return new Reserve(newReserve)
    },

    async getReservationsForOwner(ownerId){
        const reservations = await prisma.reserve.findMany({
            where: {
                property: {
                    userId: ownerId
                }
            },
            include: {
                property: true,
                user:true,
            },
            orderBy: {
                dateStart: 'asc'
            }
        });
        return reservations.map(r => new Reserve(r));
    },

    async getReservationsForUser(userId){
        const reservations = await prisma.reserve.findMany({
            where: {
                userId: userId 
            },
            include: {
                property: true
            },
            orderBy: {
                dateStart: 'asc'
            }
        });

        return reservations.map(r => new Reserve(r));
    },

    async updateReserve(reserveId, userId, updateData){
        const reserve = await prisma.reserve.findUnique({
            where: { id: reserveId }
        });

        if(!reserve){
            throw new Error("Reserva não existe");
        }

        if(reserve.userId !== userId){
            throw new Error("Ação não autorizada, a reserva não é sua")
        }

        if(new Date(reserve.dateStart) < new Date()){
            throw new Error("A data de início não pode ser no passado.");
        }

        const newDateStart = updateData.dateStart || reserve.dateStart;
        const newDateEnd = updateData.dateEnd || reserve.dateEnd;

        const existingReserve = await prisma.reserve.findFirst({
            where: {
                propertyId: reserve.propertyId,
                id: { not: reserveId },
                status: { not: 'CANCELADA' },
                AND: [
                    { dateStart: { lt: newDateEnd } },
                    { dateEnd: { gt: newDateStart } }
                ]
            }
        });

        if(existingReserve){
            throw new Error("O imóvel já está reservado para estas datas")
        }

        const updateReserve = await prisma.reserve.update({
            where: { id: reserveId },
            data: {
                dateStart: newDateStart,
                dateEnd: newDateEnd
            },
            include: { property: true, user: true }
        });

        return new Reserve(updateReserve)
    },

    async cancelReserve(reserveId, userId) {
        const reserve = await prisma.reserve.findUnique({
            where: { id: reserveId },
            include: { property: true }
        });

        if(!reserve){
            throw new Error("Reserva não existe")
        }

        if (reserve.userId !== userId && reserve.property.userId !== userId) {
            throw new Error("Ação não autorizada.");
        }

        if (new Date(reserve.dateStart) < new Date()) {
            throw new Error("Não é possível cancelar uma reserva que já começou.");
        }

        await prisma.reserve.update({
            where: { id: reserveId },
            data: { status: "CANCELADO" }
        })

    }
}

export default reserveService;