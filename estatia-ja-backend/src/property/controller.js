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
            const property = await propertyService.getPropertyById(id);
            res.status(200).json(property.toJSON());
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async getAllImages(req, res){
        try {
            const { propertyId } = req.params;
            const images = await propertyService.getAllImagesForProperty(propertyId);
            res.status(200).json(images);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async findAvailable(req, res){
        try {
            const { dateStart, dateEnd } = req.query;
            const properties = await propertyService.findAvailableProperties(dateStart, dateEnd);
            res.status(200).json(properties.map(property => property.toJSON()));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateData(req, res){
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const validatedData = req.body;
            const updatedProperty = await propertyService.updatePropertyData(id, validatedData, userId);
            
            res.status(200).json(updatedProperty.toJSON());
        } catch (error) {
            if (error.message.includes("Ação não autorizada")) {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes("Imóvel não existe")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    },

    async updateImages(req, res){
        try {
            const { id } = req.params;
            console.log(id)
            const files = req.files;
            const imageBuffers = files ? files.map(file => file.buffer) : [];const userId = req.user.id;
            const updateProperty = await propertyService.updatePropertyImages(id, imageBuffers, userId);
            res.status(200).json(updateProperty.toJSON());
        } catch (error) {
            if(error.message.includes("Ação não autorizada")){
                return res.status(403).json({ error: error.message });
            }
            if(error.message.includes("Imóvel não existe")){
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    },
    
    async delete(req, res){
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await propertyService.deleleProperty(id, userId);
            res.status(204).send();
        } catch (error) {
            if(error.message.includes("Ação não autorizada")) {
                return res.status(403).json({ error: error.message });
            }
            res.status(404).json({ error: error.message });
        }
    },
}

export default propertyController;