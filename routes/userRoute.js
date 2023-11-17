// usrRoute.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a user
router.post('/users', userController.createUser);

// List all users
router.get('/users', userController.getAllUsers);

// Fetch a user by userId
router.get('/users/:userId', userController.getUserById);

// Update a user by userId (protected route)
router.put('/users/:userId', userController.verifyToken, userController.updateUser);

// Delete a user by userId (protected route)
router.delete('/users/:userId', userController.verifyToken, userController.deleteUser);

module.exports = router;
