import Property from "./model.js";
import { prisma } from '../database.js';

const propertyService = {
    async createProperty(propertyData, imageBuffers, userId) {
        const newProperty = await prisma.$transaction(async (tx) => {
            const property = await tx.property.create({
                data: {
                    ...propertyData,
                    userId: userId,
                },
            });
    
            if (imageBuffers && imageBuffers.length > 0) {
                const imagesData = imageBuffers.map(buffer => ({
                    image: buffer,
                    propertyId: property.id,
                }));
    
                await tx.propertyImage.createMany({
                    data: imagesData,
                });
            }
    
            return property;
        });
    
        const resultWithImages = await this.getPropertyById(newProperty.id);
        return resultWithImages;
    },

    async getAllProperties() {
        const properties = await prisma.property.findMany({
            include: {
                images:true
            }
        });

        return properties.map(property => new Property(property));
    },

    async getPropertyById(id) {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                images: true,
                user: { select: { id: true, name: true, email: true } }
            },
        });

        if(!property) {
            throw new Error('Imóvel não existe')
        }

        return new Property(property);
    },

    async getAllImagesForProperty(id){
        const propertyExists = await prisma.property.findUnique({
            where: { id: id },
            select: { id: true }
        });

        if(!propertyExists) {
            throw new Error("Imóvel não existe")
        }

        const images = await prisma.propertyImage.findMany({
            where: { propertyId: id }
        });

        if(!images || images.length === 0) {
            throw new Error("Imóvel sem imagem");
        }

        return images;
    },

    async deleleProperty(propertyId, userId) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if(!property) {
            throw new Error("Imóvel não existe")
        }
        
        if(property.userId !== userId) {
            throw new Error("Ação não autorizada")
        }

        await prisma.property.delete({ where: { id: propertyId } });
    }
}

export default propertyService