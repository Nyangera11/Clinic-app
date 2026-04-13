import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import userService from './user.service.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export async function registerUser({ name, email, password, phone, role }) {
  const createPayload = { name, email, password, phone, role: role || 'health_worker' };
  return userService.createUser(createPayload);
}

export async function loginUser({ email, password }) {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  };
}

export default {
  registerUser,
  loginUser,
};
