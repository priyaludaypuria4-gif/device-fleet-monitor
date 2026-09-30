const request = require('supertest');

const app = require('../src/app');
const deviceStore = require('../src/store/deviceStore');

describe('Device Fleet Monitor API', () => {
  beforeEach(() => {
    deviceStore.clear();
  });

  describe('Device registration', () => {
    test('should register a new device', async () => {
      const response = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toMatchObject({
        name: 'device-1',
        status: 'OFFLINE',
        lastHeartbeat: null
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.registeredAt).toBeDefined();
    });

    test('should reject registration without a name', async () => {
      const response = await request(app)
        .post('/api/devices')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Device name is required');
    });
  });

  describe('Heartbeat handling', () => {
    test('should accept a heartbeat from a registered device', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      const response = await request(app)
        .post(`/api/devices/${deviceId}/heartbeat`);

      expect(response.statusCode).toBe(200);

      expect(response.body.id).toBe(deviceId);
      expect(response.body.status).toBe('ONLINE');
      expect(response.body.lastHeartbeat).not.toBeNull();
    });

    test('should reject heartbeat from unknown device', async () => {
      const response = await request(app)
        .post('/api/devices/non-existent-id/heartbeat');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Device not found');
    });
  });

  describe('Device status', () => {
    test('device should be OFFLINE before receiving a heartbeat', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      const response = await request(app)
        .get(`/api/devices/${deviceId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OFFLINE');
    });

    test('device should become ONLINE after heartbeat', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      await request(app)
        .post(`/api/devices/${deviceId}/heartbeat`);

      const response = await request(app)
        .get(`/api/devices/${deviceId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('ONLINE');
    });
  });

  describe('30-second timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('device should remain ONLINE within 30 seconds', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      await request(app)
        .post(`/api/devices/${deviceId}/heartbeat`);

      jest.advanceTimersByTime(29 * 1000);

      const response = await request(app)
        .get(`/api/devices/${deviceId}`);

      expect(response.body.status).toBe('ONLINE');
    });

    test('device should remain ONLINE at exactly 30 seconds', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      await request(app)
        .post(`/api/devices/${deviceId}/heartbeat`);

      jest.advanceTimersByTime(30 * 1000);

      const response = await request(app)
        .get(`/api/devices/${deviceId}`);

      expect(response.body.status).toBe('ONLINE');
    });

    test('device should become OFFLINE after 30 seconds', async () => {
      const registration = await request(app)
        .post('/api/devices')
        .send({
          name: 'device-1'
        });

      const deviceId = registration.body.id;

      await request(app)
        .post(`/api/devices/${deviceId}/heartbeat`);

      jest.advanceTimersByTime(30 * 1000 + 1);

      const response = await request(app)
        .get(`/api/devices/${deviceId}`);

      expect(response.body.status).toBe('OFFLINE');
    });
  });

  describe('List devices', () => {
    test('should return all registered devices', async () => {
      await request(app)
        .post('/api/devices')
        .send({ name: 'device-1' });

      await request(app)
        .post('/api/devices')
        .send({ name: 'device-2' });

      const response = await request(app)
        .get('/api/devices');

      expect(response.statusCode).toBe(200);
      expect(response.body.devices).toHaveLength(2);

      expect(
        response.body.devices.map((device) => device.name)
      ).toEqual(
        expect.arrayContaining([
          'device-1',
          'device-2'
        ])
      );
    });
  });

  describe('Fleet summary', () => {
    test('should return total, online and offline counts', async () => {
      const device1 = await request(app)
        .post('/api/devices')
        .send({ name: 'device-1' });

      await request(app)
        .post('/api/devices')
        .send({ name: 'device-2' });

      await request(app)
        .post(
          `/api/devices/${device1.body.id}/heartbeat`
        );

      const response = await request(app)
        .get('/api/fleet/summary');

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        total: 2,
        online: 1,
        offline: 1
      });
    });
  });
});
