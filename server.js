const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/userModel'); // Import the User model
const userRoute = require('./routes/userRoute');

const app = express();
app.use(express.json());

app.use(bodyParser.json());

mongoose.connect('mongodb+srv://meet:meet14@cluster0.yqvokoa.mongodb.net/meet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected...');
}).catch(err => {
  console.log(err);
});

app.get('/', (req, res) => {
  res.json({ Message: 'Welcome to your application' });
});

app.use('/api', userRoute);

const jwtSecret = 'f927ef072c9828aab78ba4e018f06f56175b061f9393bb1ff1d7ac0eff8bf786';

app.use(express.json()); 

// Middleware to extract user ID from token and set it in the request
const extractUserId = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (!err) {
        req.userId = decodedToken.userId;
      }
    });
  }

  next();
};

app.use(extractUserId);

app.post('/api/users', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    name: req.body.name 
  });

  newUser.save()
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(err.errors).forEach(key => {
          validationErrors[key] = err.errors[key].message;
        });
        res.status(400).json({ error: 'Validation failed', details: validationErrors });
      } else {
        res.status(500).json({ error: 'Internal server error', details: err.message });
      }
    });
});

// ... (other routes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON' });
  } else {
    next();
  }
});

// ... (other routes)

// Middleware to verify if the user making the request is the owner of the resource
const verifyOwnership = (req, res, next) => {
  if (req.params.userId !== req.userId) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission for this operation' });
  }
  next();
};

app.delete('/api/users/:userId', verifyOwnership, (req, res) => {
  // Find and delete the user from the database
  User.findByIdAndDelete(req.params.userId)
    .then(deletedUser => {
      if (deletedUser) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.put('/api/users/:userId', verifyOwnership, (req, res) => {
  // Find and update the user in the database
  User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
    .then(updatedUser => {
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });
});
app.delete('/api/users', async (req, res) => {
  try {
    // Use the User model to delete all documents in the "users" collection
    const result = await User.deleteMany({});

    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});