const request = require('supertest');
const express = require('express');
const userProfileRoutes = require('../server/routes/user-profile-updated');
const db = require('../server/db');

const app = express();
app.use(express.json());

// Mock authentication middleware to set req.user
app.use((req, res, next) => {
  req.user = { id: 1 }; // Assuming test user with id 1
  next();
});

app.use('/user-profile', userProfileRoutes);

describe('User Profile Update', () => {
  beforeAll((done) => {
    // Insert a test user if not exists
    db.run(
      `INSERT OR IGNORE INTO users (id, username, password, email) VALUES (1, 'testuser', 'testpass', 'testuser@example.com')`,
      done
    );
  });

  it('should update user profile successfully', async () => {
    const response = await request(app)
      .put('/user-profile')
      .send({
        name: 'Test',
        lastname: 'User',
        service: 'Test Service',
        email: 'testuser@example.com',
        phone: '1234567890'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Profile updated successfully');

    // Verify update in DB
    db.get('SELECT * FROM users WHERE id = 1', (err, row) => {
      expect(row.name).toBe('Test');
      expect(row.lastname).toBe('User');
      expect(row.service).toBe('Test Service');
      expect(row.phone).toBe('1234567890');
    });
  });

  it('should upload and save profile image successfully', async () => {
    const response = await request(app)
      .put('/user-profile')
      .field('name', 'Test')
      .field('lastname', 'User')
      .field('service', 'Test Service')
      .field('email', 'testuser@example.com')
      .field('phone', '1234567890')
      .attach('profileImage', 'tests/sample-profile-image.txt');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Profile updated successfully');

    // Verify profileImage field is updated in DB
    db.get('SELECT profileImage FROM users WHERE id = 1', (err, row) => {
      expect(row.profileImage).toBeDefined();
      expect(row.profileImage).toMatch(/uploads\/1\//);
    });
  });
});
