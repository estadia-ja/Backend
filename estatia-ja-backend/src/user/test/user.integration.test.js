import { describe, it, expect, afterEach } from "vitest";
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../database';

describe('User Routes - Integration Tests (End-to-End', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe('post /user', () =>{
    it('sholud create a new user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
      };

      const response = await request(app)
        .post('/user')
        .send(userTest);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userTest.email);

      const userInDb = await prisma.user.findUnique({
        where: { email: userTest.email },
      });
      expect(userInDb).not.toBeNull();
    });

    it('should return status 400 if validation fails', async () => {
      const userInvalid = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
      };

      const response = await request(app)
        .post('/user')
        .send(userInvalid);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return status 400 if the email is already exist', async () => {
      const userExists = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123',
      };

      await request(app).post('/user').send(userExists);

      const newUser = {
        name: 'Pedro Cabeceira',
        email: 'pedro.test@example.com',
        password: 'Password12345',
      };

      const response = await request(app)
        .post('/user')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email já cadastrado');
    });
  });
});

