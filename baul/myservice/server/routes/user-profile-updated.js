
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer storage for user uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!req.user) {
      return cb(new Error('Unauthorized'));
    }
    const userId = req.user.id;
    const uploadPath = path.join(__dirname, '..', 'uploads', String(userId));
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use original filename with timestamp prefix to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    // Accept documents, images, and videos only
    const allowedExt = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|mp4|mov|avi|mkv|txt/;
    const allowedMime = /image\/jpeg|image\/jpg|image\/png|image\/gif|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|video\/mp4|video\/quicktime|video\/x-msvideo|video\/x-matroska|text\/plain/;
    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMime.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents, images, and videos are allowed'));
    }
  }
});

// Get current user profile
router.get('/', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = req.user.id;
  db.get('SELECT id, username, email, role, name, lastname, service, phone, profileImage FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Update current user profile with file upload
router.put('/', (req, res, next) => {
  console.log('PUT /user-profile called');
  upload.single('profileImage')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.user) {
    console.error('Unauthorized access attempt to /user-profile');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = req.user.id;
  console.log('Authenticated user id:', userId);
  const { name, lastname, service, email, phone } = req.body;

  let profileImagePath = req.body.profileImage || null;
  if (req.file) {
    profileImagePath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
    console.log('Profile image file uploaded:', profileImagePath);
  } else {
    console.log('No profile image file uploaded');
  }

  const sql = `UPDATE users SET name = ?, lastname = ?, service = ?, email = ?, phone = ?, profileImage = ? WHERE id = ?`;
  const params = [name, lastname, service, email, phone, profileImagePath, userId];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('User profile updated successfully for user id:', userId);
    // Query updated user data
    db.get('SELECT id, username, email, role, name, lastname, service, phone, profileImage FROM users WHERE id = ?', [userId], (err2, updatedUser) => {
      if (err2) {
        console.error('Error fetching updated user profile:', err2);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Returning updated user profile:', updatedUser);
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    });
  });
});

module.exports = router;
