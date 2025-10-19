import clientValuationService from './service.js';

const clientValuationController = {
    async create(req, res) {
        try {
            const { reserveId } = req.params;
            const ownerId  = req.user.id;
            const valuationData = req.validatedData;

            const valuation = await clientValuationService.createClientValuation(reserveId, ownerId, valuationData);
            res.status(200).json(valuation.toJSON());
        } catch (error) {
            if (error.message.includes("Este cliente já foi avaliado para esta reserva.")) {
                return res.status(409).json({ error: error.message });
            }
            if (error.message.includes("Ação não autorizada. Você não é o proprietário do imóvel desta reserva.")) {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes("Reserva não existe.")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    }
}

export default clientValuationController;