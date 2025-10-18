import PropertyValuation from "./model.js";
import { prisma } from '../database.js';

const propertyValuationService = {
    async createPropertyValuation(reserveId, userId, valuationData) {
        const reserve = await prisma.reserve.findUnique({
            where: { id: reserveId },
            include: {
                propertyValuation: true
            }
        });

        if(!reserve) {
            throw new Error("Reserva não encontrada.");
        }

        if(reserve.userId !== userId) {
            throw new Error("Ação não autorizada. Você não pode avaliar uma reserva que não é sua.");
        }

        if(reserve.propertyValuation) {
            throw new Error("Esta reserva já foi avalia.")
        }

        // if(new Date(reserve.dateEnd) > new Date()) {
        //     throw new Error("Você só pode avaliar a estadia após a data de término da reserva.")
        // }

        const newValuation = await prisma.propertyValuation.create({
            data: {
                reserveId: reserveId,
                noteProperty: valuationData.noteProperty,
                commentProperty: valuationData.commentProperty
            }
        });

        return new PropertyValuation(newValuation);
    },

    async deletePropertyValuation(valuationId, userId){
        const valuation = await prisma.propertyValuation.findUnique({
            where: { id: valuationId },
            include: {
                reserve: true
            }
        });

        if(!valuation) {
            throw new Error("AValiação não existe.");
        }

        if(valuation.reserve.userId !== userId){
            throw new Error("Ação não autorizada. Vacê não pode deletar uma avaliação que não é sua.");
        }

        await prisma.propertyValuation.delete({
            where: { id: valuationId }
        });
    },
}

export default propertyValuationService;