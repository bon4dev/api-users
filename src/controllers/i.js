const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

module.exports = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const userExists = await connection('users')
        .where('email', email)
        .first();

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Modified insert to return the ID explicitly
      const id = await connection('users')
        .insert({
          name,
          email,
          password: hashedPassword,
        })
        .then(([id]) => id);

      return res.json({ id, name, email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await connection('users').where('email', email).first();

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '1d',
      });

      return res.json({ user: { id: user.id, name: user.name, email }, token });
    } catch (error) {
      return res.status(500).json({ error: 'Login failed' });
    }
  },

  async index(req, res) {
    try {
      const users = await connection('users').select('id', 'name', 'email');

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to list users' });
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      const user = await connection('users')
        .where('id', id)
        .select('id', 'name', 'email')
        .first();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get user' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await connection('users').where('id', id).first();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await connection('users').where('id', id).update(updateData);

      return res.json({ message: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await connection('users').where('id', id).first();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await connection('users').where('id', id).delete();

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  },
};
