const express = require('express');
const UserController = require('./controllers/UserController');
const authMiddleware = require('./middleware/auth');

const routes = express.Router();

// Public routes
routes.post('/users/register', UserController.register);
routes.post('/users/login', UserController.login);

// Protected routes
routes.use(authMiddleware);
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);

module.exports = routes;
