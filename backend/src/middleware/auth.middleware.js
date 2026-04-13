import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import userService from '../services/user.service.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    console.error('authMiddleware error', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
