import bcrypt from 'bcryptjs';
import * as userModel from '../models/user.model.js';

export async function createUser({ name, email, password, phone = '', role = 'health_worker' }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return userModel.createUser({ name, email, passwordHash, phone, role });
}

export async function getUserByEmail(email) {
  return userModel.findByEmail(email);
}

export async function getUserById(id) {
  return userModel.findById(id);
}

export async function listUsers() {
  return userModel.listUsers();
}

export async function listDoctors() {
  return userModel.listDoctors();
}

export async function listPatients() {
  return userModel.listPatients();
}

export default {
  createUser,
  getUserByEmail,
  getUserById,
  listUsers,
  listDoctors,
  listPatients,
};
