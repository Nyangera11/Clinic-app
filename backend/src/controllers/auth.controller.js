import authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, role } = req.body;
    const createdUser = await authService.registerUser({ name, email, password, phone, role });
    res.status(201).json({ 
      id: createdUser.id, 
      name: createdUser.name, 
      email: createdUser.email, 
      phone: createdUser.phone,
      role: createdUser.role 
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    res.json(data);
  } catch (error) {
    next(error);
  }
}
