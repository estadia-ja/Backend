import propertyValuationService from './service.js';

const propertyValuationController = {
    async create(req, res) {
        try {
            const { reserveId } = req.params;
            const userId = req.user.id;
            const valuationData = req.validatedData;

            const valuation = await propertyValuationService.createPropertyValuation(reserveId, userId, valuationData);

            res.status(201).json(valuation.toJson());
        } catch (error) {
            if (error.message.includes("já foi avaliada")) {
                return res.status(409).json({ error: error.message });
            }
            if (error.message.includes("Ação não autorizada")) {
                return res.status(403).json({ error: error.message });n
            }
            if (error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message }); 
            }
            res.status(400).json({ error: error.message });
        }
    }
}

export default propertyValuationController;