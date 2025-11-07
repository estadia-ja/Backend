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

    async getMyProperties(req, res) {
        try {
            const userId = req.user.id;
            
            const properties = await propertyService.getPropertiesByUserId(userId);
            
            res.status(200).json(properties.map(p => p.toJSON()));
        } catch (error) {
            res.status(404).json({ error: error.message });
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

    async getImageById(req, res) {
        try {
            const { imageId } = req.params;
            const imageBuffer = await propertyService.getImageById(imageId);

            res.set("Content-Type", "image/png");
            res.send(imageBuffer);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async findAvailable(req, res){
        try {
            const { dateStart, dateEnd, state, guests } = req.query;

            const properties = await propertyService.findAvailableProperties(
                dateStart, 
                dateEnd, 
                state, 
                guests
            );
            res.status(200).json(properties);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getByCity(req, res) {
        try {
            const { city } = req.params;
            const properties = await propertyService.getPropertyByCity(city);
            
            res.status(200).json(properties);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async findRanked(req, res) {
        try {
            const properties = await propertyService.findPropertiesRankedByValuation();
            res.status(200).json(properties.map(property => property.toJSON()));
        } catch (error) {
            console.error("Erro ao buscar ranking de imóveis:", error);
            res.status(500).json({ error: "Erro ao processar a busca por ranking." });
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