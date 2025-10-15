import reserveService from "./service.js";

const reserveController = {
    async create(req, res){
        try {
            const { propertyId } = req.params;
            const userId = req.user.id;
            const reserveData = req.validatedData;
            console.log(propertyId, userId, reserveData)
            const reserve = await reserveService.createReserve(propertyId, userId, reserveData);
            res.status(201).json(reserve.toJSON());
        } catch (error) {
            if(error.message.includes("O imóvel já está reservado para estas datas. Conflito de disponibilidade.")){
                return res.status(409).json({ error: error.message });
            }

            if(error.message.includes("Você não pode reservar seu própio imóvel.")){
                return res.status(403).json({ error: error.message });
            }

            if(error.message.includes("Imóvel não existe")){
                return res.status(404).json({ error: error.message });
            }

            return res.status(400).json({ error: error.message });
        }
    },

    async update(req, res){
        try {
            const { reserveId } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const updateReserve = await reserveService.updateReserve(reserveId,userId,updateData)
            res.status(200).json(updateReserve.toJSON());
        } catch (error) {
            if (error.message.includes("O imóvel já está reservado para estas datas") || error.message.includes("novas datas")) {
                return res.status(409).json({ error: error.message }); // Conflict
            }
            if (error.message.includes("Ação não autorizada, a reserva não é sua")) {
                return res.status(403).json({ error: error.message }); // Forbidden
            }
            if (error.message.includes("Reserva não existe")) {
                return res.status(404).json({ error: error.message }); // Not Found
            }
            res.status(400).json({ error: error.message });
        }
    },

    async cancel(req, res){
        try {
            const { reserveId } = req.params;
            const userId = req.user.id;

            await reserveService.cancelReserve(reserveId, userId);
            res.status(204).send();
        } catch (error) {
            if (error.message.includes("Ação não autorizada")) {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes("Reserva não existe")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    }
}

export default reserveController