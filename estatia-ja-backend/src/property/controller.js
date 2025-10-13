import propertyService from "./service.js";

const propertyController = {
    async create(req, res) {
        try {
            const userId = req.user.id
            const propertyData = req.validatedData;
            const files = req.files;
            const imageBuffers = files ? files.map(file => file.buffer) : [];
            const property = await propertyService.createProperty(propertyData, imageBuffers, userId);
            res.status(201).json(property.toJSON());
        } catch (error) {
            console.error("Erro ao criar imóvel:", error);
            res.status(400).json({ error: error.message });
        }
    }
}

export default propertyController;