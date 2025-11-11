import { describe, vi, expect, it } from 'vitest';
import Property from '../model.js';

describe('test property model', () => {
  it('should create a Property instance', () => {
    const data = {
      id: 1,
      type: 'Casa',
      description: 'Uma casa muito boa para a família inteira',
      maxGuests: 4,
      numberOfBedroom: 3,
      numberOfSuite: 1,
      numberOfGarage: 2,
      numberOfRoom: 2,
      numberOfBathroom: 3,
      outdoorArea: true,
      pool: true,
      barbecue: true,
      street: 'Rua C',
      number: '23',
      neighborhood: 'Centro',
      state: 'SP',
      city: 'São Paulo',
      CEP: '09789-879',
      dailyRate: 670.99,
      userId: 1,
      images: [{ id: 'image-cuid-1', image: Buffer.from('imagetest1') }],
      user: { id: 1, name: 'Proprietário Teste' },
    };

    const property = new Property(data);

    expect(property).toBeInstanceOf(Property);
    expect(property.id).toBe(data.id);
    expect(property.type).toBe(data.type);
    expect(property.description).toBe(data.description);
    expect(property.numberOfBedroom).toBe(data.numberOfBedroom);
    expect(property.dailyRate).toBe(data.dailyRate);
    expect(property.user).toEqual(data.user);
    expect(property.images).toEqual([{ id: 'image-cuid-1' }]);
  });

  it('should result in an empty images array if data.images is an empty array', () => {
    const dataWithEmptyImages = {
      id: 3,
      type: 'Loft',
      images: [],
    };

    const property = new Property(dataWithEmptyImages);

    expect(property.images).toEqual([]);
    expect(property.images).toHaveLength(0);
  });

  it('toJSON() method should return the instance itself', () => {
    const data = { id: 4, type: 'Sítio' };
    const property = new Property(data);

    const jsonResult = property.toJSON();

    expect(jsonResult).toBe(property);
    expect(jsonResult.id).toBe(4);
  });
});
