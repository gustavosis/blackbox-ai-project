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

describe('User Profile Settings API', () => {
  beforeAll((done) => {
    // Insert a test user if not exists
    db.run(
      `INSERT OR IGNORE INTO users (id, username, password, email) VALUES (1, 'testuser', 'testpass', 'testuser@example.com')`,
      done
    );
  });

  it('should get user profile successfully', async () => {
    const response = await request(app).get('/user-profile');
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(1);
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
    expect(response.body.user).toBeDefined();
    expect(response.body.user.name).toBe('Test');
  });
});
