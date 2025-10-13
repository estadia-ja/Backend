import Property from "./model.js";
import { prisma } from '../database.js';

const propertyService = {
    async createProperty(propertyData, imageBuffer, userId) {
        const newProperty = await prisma.$transaction(async (tx) => {
            const property = await tx.property.create ({
                data: {
                    ...propertyData,
                    userId: userId,
                }
            });

            if ( imageBuffer && imageBuffer.lenght > 0){
                const imagesData = imageBuffer.map(buffer => ({
                    image: buffer,
                    propertyId: property.id,
                }));

                await tx.propertyImage.createMany({
                    data:imagesData,
                });
            }

            return property
        });

        return new Property(newProperty)
    },

    async getAllProperties() {
        const properties = await prisma.property.findMany({
            include: {
                images:true
            }
        });

        return properties.map(property => new Property(property));
    },

    async getPropertyByID(id) {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                images: true,
                user: { select: { id: true, name: true, email: true } }
            },
        });

        if(!property) {
            throw new Error("Imóvel não existe")
        }

        return new Property(property);
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