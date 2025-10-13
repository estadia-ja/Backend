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
    },

    async getAll(req, res) {
        try {
            const properties = await propertyService.getAllProperties();
            res.status(200).json(properties.map(property => property.toJSON()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const property = await propertyService.getPropertyByID(id);
            res.status(200).json(property.toJSON());
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

export default propertyController;