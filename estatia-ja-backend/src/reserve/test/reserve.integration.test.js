import { describe, it, afterEach, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../database.js';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { response } from 'express';

const propertyData = {
  type: 'Casa',
  description: 'Casa de teste para reservas',
  numberOfBedroom: 3,
  numberOfSuite: 1,
  numberOfGarage: 2,
  numberOfRoom: 2,
  numberOfBathroom: 3,
  outdoorArea: true,
  pool: true,
  barbecue: true,
  street: 'Rua Teste Reserva',
  number: 123,
  neighborhood: 'Bairro Teste Reserva',
  state: 'SP',
  city: 'São Paulo',
  CEP: '01001-001',
  dailyRate: 350.0,
};

describe('Reserve Routes - Integration Tests', () => {
  let ownerToken, renterToken, randomToken;
  let owner, renter, randomUser, property;

  beforeEach(async () => {
    const hashedPassword = await hash('Password123', 10);

    owner = await prisma.user.create({
      data: {
        name: 'Usuário Dono',
        email: 'owner-reserve@test.com',
        password: hashedPassword,
        cpf: '111.111.111-11',
      },
    });

    renter = await prisma.user.create({
      data: {
        name: 'Usuário Hóspede',
        email: 'hospede-reserve@test.com',
        password: hashedPassword,
        cpf: '222.222.222-22',
      },
    });

    randomUser = await prisma.user.create({
      data: {
        name: 'Usuário Aleatório',
        email: 'random-reserve@test.com',
        password: hashedPassword,
        cpf: '333.333.333-33',
      },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido!');
    }

    ownerToken = jwt.sign({ userId: owner.id, email: owner.email }, jwtSecret, {
      expiresIn: '1h',
    });

    renterToken = jwt.sign(
      { userId: renter.id, email: renter.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    randomToken = jwt.sign(
      { userId: randomUser.id, email: randomUser.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    property = await prisma.property.create({
      data: {
        ...propertyData,
        userId: owner.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.propertyValuation.deleteMany({});
    await prisma.clientValuation.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.propertyImage.deleteMany({});
    await prisma.reserve.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.phone.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('POST /property/:propertyId/reserve', () => {
    it('should create a new reserve', async () => {
      const reserveData = {
        dateStart: new Date('2026-01-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-01-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post(`/property/${property.id}/reserve`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(reserveData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(property.id);
      expect(response.body.userId).toBe(renter.id);
      expect(response.body.status).toBe('CONFIRMADA');

      const reserveInDb = await prisma.reserve.findUnique({
        where: { id: response.body.id },
      });

      expect(reserveInDb).not.toBeNull();
      expect(reserveInDb.userId).toBe(renter.id);
    });

    it('should return 409 if dates are alaready reserved', async () => {
      await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-02-10T14:00:00Z'),
          dateEnd: new Date('2026-02-15T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });

      const overLappingRserve = {
        dateStart: new Date('2026-02-12T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-02-17T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post(`/property/${property.id}/reserve`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(overLappingRserve);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('O imóvel já está reservado');
    });

    it('should return 403 if owner tries to reserve their own property', async () => {
      const reserveData = {
        dateStart: new Date('2026-03-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-03-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post(`/property/${property.id}/reserve`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(reserveData);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain(
        'Você não pode reservar seu própio imóvel.'
      );
    });

    it('should return 400 if dateStart is in the past', async () => {
      const reserveData = {
        dateStart: new Date('2020-01-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-01-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post(`/property/${property.id}/reserve`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(reserveData);

      expect(response.status).toBe(400);
    });

    it('should return 401 if user is not authenticated', async () => {
      const reserveData = {
        dateStart: new Date('2026-01-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-01-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post(`/property/${property.id}/reserve`)
        .send(reserveData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /reserve/owner', () => {
    it('should get all reservations for the owner', async () => {
      const reserve = await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-04-10T14:00:00Z'),
          dateEnd: new Date('2026-04-15T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });

      const response = await request(app)
        .get(`/reserve/owner`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(reserve.id);
    });
  });

  describe('GET /reserve/my-reservations', () => {
    it('should get reservations made by the user', async () => {
      const reserve = await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-04-10T14:00:00Z'),
          dateEnd: new Date('2026-04-15T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });

      const response = await request(app)
        .get('/reserve/my-reservations')
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(reserve.id);
    });
  });

  describe('DELETE /reserve/:reserveId', async () => {
    let reserve;

    beforeEach(async () => {
      reserve = await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-04-10T14:00:00Z'),
          dateEnd: new Date('2026-04-15T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });
    });

    it('should allow the renter to cancel their reserve', async () => {
      const response = await request(app)
        .delete(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${renterToken}`);

      expect(response.status).toBe(204);

      const reserveInDb = await prisma.reserve.findUnique({
        where: { id: reserve.id },
      });
      expect(reserveInDb.status).toBe('CANCELADO');
    });

    it('should aloow the property owner to cancel the reserve', async () => {
      const response = await request(app)
        .delete(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      const reserveInDb = await prisma.reserve.findUnique({
        where: { id: reserve.id },
      });
      expect(reserveInDb.status).toBe('CANCELADO');
    });

    it('should return 403 is a different user tries to cancel', async () => {
      const response = await request(app)
        .delete(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${randomToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Ação não autorizada');
    });
  });

  describe('PUT /reserve/:reserveId', () => {
    let reserve;

    beforeEach(async () => {
      reserve = await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-04-10T14:00:00Z'),
          dateEnd: new Date('2026-04-15T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });
    });

    it('should update the reserve', async () => {
      const reserveData = {
        dateStart: new Date('2026-01-13T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-01-17T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .put(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(reserveData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.propertyId).toBe(property.id);
      expect(response.body.userId).toBe(renter.id);
      expect(response.body.status).toBe('CONFIRMADA');

      const reserveInDb = await prisma.reserve.findUnique({
        where: { id: response.body.id },
      });

      expect(reserveInDb).not.toBeNull();
      expect(reserveInDb.userId).toBe(renter.id);
      expect(reserveInDb.dateStart).toEqual(new Date('2026-01-13T14:00:00Z'));
    });

    it('should return 409 if dates are alaready reserved', async () => {
      await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2026-02-17T14:00:00Z'),
          dateEnd: new Date('2026-02-20T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });

      const overLappingRserve = {
        dateStart: new Date('2026-02-17T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-02-20T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .put(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(overLappingRserve);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('O imóvel já está reservado');
    });

    it('should return 403 if owner tries to reserve their own property', async () => {
      const reserveData = {
        dateStart: new Date('2026-05-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-05-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .put(`/reserve/${reserve.id}`)
        .set('Authorization', `Bearer ${randomToken}`)
        .send(reserveData);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain(
        'Ação não autorizada, a reserva não é sua'
      );
    });

    it('should return 400 if dateStart is in the past', async () => {
      const pastReserve = await prisma.reserve.create({
        data: {
          propertyId: property.id,
          userId: renter.id,
          dateStart: new Date('2020-01-01T14:00:00Z'), // Data no passado
          dateEnd: new Date('2020-01-05T11:00:00Z'),
          status: 'CONFIRMADA',
        },
      });

      const updateData = {
        dateStart: new Date('2020-01-02T14:00:00Z').toISOString(),
        dateEnd: new Date('2020-01-06T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .put(`/reserve/${pastReserve.id}`)
        .set('Authorization', `Bearer ${renterToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    it('should return 401 if user is not authenticated', async () => {
      const reserveData = {
        dateStart: new Date('2026-01-10T14:00:00Z').toISOString(),
        dateEnd: new Date('2026-01-15T11:00:00Z').toISOString(),
      };

      const response = await request(app)
        .put(`/reserve/${reserve.id}`)
        .send(reserveData);

      expect(response.status).toBe(401);
    });
  });
});
