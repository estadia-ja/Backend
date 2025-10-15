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

        if(propertyId.userId === userId){
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
    }
}

export default reserveService;