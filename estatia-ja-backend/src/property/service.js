import Property from "./model.js";
import { prisma } from '../database.js';
import { Prisma } from '@prisma/client';

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

        const ratingAggregation = await prisma.propertyValuation.aggregate({
            _avg: {
                noteProperty: true,
            },
            where: {
                reserve: {
                    propertyId: id,
                },
            },
        });

        const avgRating = ratingAggregation._avg.noteProperty;
        
        property.avgRating = avgRating;

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

    async getImageById(imageId) {
        const image = await prisma.propertyImage.findUnique({
            where: { id: imageId },
            select: { image: true } 
        });

        if (!image) {
            throw new Error("Imagem não encontrada");
        }
        
        return image.image;
    },

    async findAvailableProperties(dateStart, dateEnd, state, guests) {
        if (!dateStart || !dateEnd) {
            throw new Error("as datas de início e fim são obrigatórias.");
        }

        const whereClause = {
            reserves: {
                none: {
                    status: { not: 'CANCELADA' },
                    AND: [
                        { dateStart: { lt: new Date(dateEnd) } },
                        { dateEnd: { gt: new Date(dateStart) } }
                    ]
                }
            }
        };

        if (state) {
            whereClause.state = state; 
        }

        if (guests) {
            const numGuests = parseInt(guests, 10);
            if (!isNaN(numGuests) && numGuests > 0) {
                whereClause.maxGuests = {
                    gte: numGuests
                };
            }
        }

        const availableProperties = await prisma.property.findMany({
            where: whereClause,
            include: {
                images: {
                    select: {
                        id: true
                    }
                },
                user: {
                    select: { id: true, name: true }
                }
            }
        });
        
        return availableProperties;
    },

    async findPropertiesRankedByValuation() {
        const rankedProperties = await prisma.$queryRaw(
            Prisma.sql`
                SELECT
                    p.*,
                    AVG(pv."noteProperty") as "avgRating"
                FROM
                    "properties" AS p
                INNER JOIN
                    "reserves" AS r ON p.id = r."propertyId"
                INNER JOIN
                    "property_valuations" AS pv ON r.id = pv."reserveId"
                GROUP BY
                    p.id
                ORDER BY
                    "avgRating" DESC
            `
        );

        return rankedProperties.map(property => new Property(property))
    },

    async getPropertyByCity(city) {
        const properties = await prisma.property.findMany({
            where: { 
                city: city 
            }, 
            include: {
                images: {
                    select: {
                        id: true 
                    }
                },
                user: { select: { id: true, name: true, email: true } }
            },
        });
    
        if (!properties || properties.length === 0) {
            throw new Error('Nenhum imóvel encontrado nesta cidade');
        }
    
        const propertiesWithRating = await Promise.all(
            properties.map(async (property) => {
                const ratingAggregation = await prisma.propertyValuation.aggregate({
                    _avg: {
                        noteProperty: true,
                    },
                    where: {
                        reserve: {
                            propertyId: property.id,
                        },
                    },
                });
    
                const avgRating = ratingAggregation._avg.noteProperty || 0;
    
                return {
                    ...property,
                    avgRating: avgRating,
                };
            })
        );
    
        return propertiesWithRating;
    },

    async updatePropertyData(propertyId, updateData, userId){
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property){
            throw new Error("Imóvel não existe");
        }

        if (property.userId !== userId){
            throw new Error("Ação não autorizada");
        }

        const updateProperty = await prisma.property.update({
            where: { id: propertyId },
            data: updateData
        });

        return this.getPropertyById(updateProperty.id)
    },

    async updatePropertyImages(propertyId, newImageBuffers, userId){
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if(!property){
            throw new Error("Imóvel não existe");
        }

        if(property.userId !== userId){
            throw new Error("Ação não autorizada");
        }

        await prisma.$transaction(async (tx) => {
            await tx.propertyImage.deleteMany({
                where: { propertyId: propertyId },
            });

            if(newImageBuffers && newImageBuffers.length > 0){
                const imagesData = newImageBuffers.map(buffer => ({
                    image: buffer,
                    propertyId: propertyId,
                }));
    
                await tx.propertyImage.createMany({
                    data: imagesData,
                });
            }
        });

        return this.getPropertyById(propertyId)
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