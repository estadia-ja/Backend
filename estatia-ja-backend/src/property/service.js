import Property from "./model.js";
import { prisma } from '../database.js';

const propertyService = {
    async createProperty(propertyData, imageBuffers, userId) {
        // A transação garante que ou tudo é salvo, ou nada é.
        const newProperty = await prisma.$transaction(async (tx) => {
            // 1. Cria o imóvel para ter um ID
            const property = await tx.property.create({
                data: {
                    ...propertyData,
                    userId: userId,
                },
            });
    
            // 2. CORREÇÃO: Usar 'length' em vez de 'lenght'
            if (imageBuffers && imageBuffers.length > 0) {
                // Prepara os dados para a criação de múltiplas imagens
                const imagesData = imageBuffers.map(buffer => ({
                    image: buffer,
                    propertyId: property.id, // Associa cada imagem ao ID do imóvel
                }));
    
                // 3. Cria todas as imagens de uma vez
                await tx.propertyImage.createMany({
                    data: imagesData,
                });
            }
    
            // A transação retorna o imóvel básico que foi criado
            return property;
        });
    
        // 4. MELHOR PRÁTICA: Após a transação ser um sucesso, buscamos o imóvel
        // completo com suas imagens para retornar uma resposta precisa.
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