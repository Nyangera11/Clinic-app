import userService from '../services/user.service.js';

export async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const doctors = await userService.listDoctors();
    res.json(doctors);
  } catch (error) {
    next(error);
  }
}

export async function listPatients(req, res, next) {
  try {
    const patients = await userService.listPatients();
    res.json(patients);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.createUser({ name, email, password, role });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
}

export default {
  listUsers,
  listDoctors,
  listPatients,
  createUser,
};
