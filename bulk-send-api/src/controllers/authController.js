const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
