import { prisma } from '../database.js';
import Payment from './model.js';

const paymentService = {
    async cretaePayment(reserveId, userId, paymentData){
        const reserve = await prisma.reserve.findUnique({
            where: { id: reserveId },
            include: {
                property: true,
                payment: true,
            }
        });

        if(!reserve) {
            throw new Error("Reserva não existe.");
        }

        if(reserve.userId !== userId){
            throw new Error("Ação não autorizada. Esta reserva não pertence a você.");
        }

        if(reserve.payment){
            throw new Error("Esta reserva já foi paga.");
        }

        const dateStart = new Date(reserve.dateStart);
        const dateEnd = new Date(reserve.dateEnd);
        const timeDiff = dateEnd.getTime() - dateStart.getTime();
        const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 *24 ));
        const totalValue = numberOfDays * reserve.property.dailyRate;

        console.log(`Simulando pagamento de R$${totalValue.toFixed(2)} para a reserva ${reserveId} via ${paymentData.paymentMethod}`);

        const createPayment = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    reserveId: reserveId,
                    paymentValue:totalValue,
                    datePayment:new Date()
                }
            });

            await tx.reserve.update({
                where: { id: reserveId },
                data: { status: 'PAGA' }
            });

            return payment;
        });

        return new Payment(createPayment);
    }
}

export default paymentService