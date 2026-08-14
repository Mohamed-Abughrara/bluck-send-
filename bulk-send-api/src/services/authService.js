const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SALT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

async function register(email, password) {
  // Check for existing user
  const existing = db.findWhere('users', (u) => u.email === email.toLowerCase());
  if (existing.length > 0) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await db.insert('users', {
    email: email.toLowerCase(),
    password_hash: hashed,
  });

  return sanitizeUser(user);
}

async function login(email, password) {
  const [user] = db.findWhere('users', (u) => u.email === email.toLowerCase());
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return { token, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { register, login, sanitizeUser };
