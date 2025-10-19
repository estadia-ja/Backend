import { prisma } from '../database.js';
import ClientValuation from './model.js';

const clientValuationService = {
    async createClientValuation(reserveId, ownerId, valuationData) {
        const reserve = await prisma.reserve.findUnique({
            where: { id: reserveId },
            include: {
                property: true,       
                clientValuation: true 
            }
        });

        if (!reserve) {
            throw new Error("Reserva não existe.");
        }
        if (reserve.property.userId !== ownerId) {
            throw new Error("Ação não autorizada. Você não é o proprietário do imóvel desta reserva.");
        }
        if (reserve.clientValuation) {
            throw new Error("Este cliente já foi avaliado para esta reserva.");
        }
        // if (new Date(reserve.dateEnd) > new Date()) {
        //     throw new Error("Você só pode avaliar o cliente após o término da data da reserva.");
        // }

        const newClientValuation = await prisma.clientValuation.create({
            data: {
                reserveId: reserveId,
                noteClient: valuationData.noteClient,
                commentClient: valuationData.commentClient
            }
        });

        return new ClientValuation(newClientValuation);
    },
    
    async deleteClientValuation(valuationId, ownerId){
        const valuation = await prisma.clientValuation.findUnique({
            where: { id: valuationId },
            include: { reserve: { include: {property: true } } }
        });

        if(!valuation){
            throw new Error("Avaliação não existe.");
        }

        if(valuation.reserve.property.userId !== ownerId){
            throw new Error("Ação não autorizada. Você não pode deletar esta avaliação.");
        }

        await prisma.clientValuation.delete({
            where:{ id: valuationId }
        });
    }
}

export default clientValuationService;