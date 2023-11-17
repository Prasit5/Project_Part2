const User = require('../models/userModel');
// Create a user
exports.createUser = (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    name: req.body.name
  });

  newUser.save()
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json({ error: err }));
};

// List all users
exports.getAllUsers = (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: err }));
};

// Fetch a user by userId
exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err }));
};

// Update a user by userId
exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
    .then(user => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err }));
};

// Delete a user by userId
exports.deleteUser = (req, res) => {
  User.findByIdAndDelete(req.params.userId)
    .then(user => {
      if (user) {
        res.json({ message: 'User deleted' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err }));
};
// userController.js

const jwt = require('jsonwebtoken');

// Function to generate JWT token
function generateToken(user) {
  const payload = {
    userId: user._id,
    // Add any other user information to the payload
  };
  const options = {
    expiresIn: '1h', // Token expiration time (adjust as needed)
  };
  return jwt.sign(payload, jwtSecret, options);
}

// User login route
exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  // Check user credentials (e.g., username and password)
  // Replace this with your actual authentication logic
  User.findOne({ username, password })
    .then(user => {
      if (!user) {
        // If user is not found or credentials are invalid, return an error response
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Generate and send JWT token if credentials are valid
      const token = generateToken(user);
      res.json({ token });
    })
    .catch(err => {
      // Handle database or other errors
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
};
// userController.js

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
    req.userId = decodedToken.userId; // Store user ID in request for later use
    next();
  });
};
