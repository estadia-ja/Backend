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
    }
}

export default propertyService