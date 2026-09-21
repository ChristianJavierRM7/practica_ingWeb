const bcrypt = require('bcryptjs');
const db = require('../config/db');
const JwtService = require('../security/jwtService');

class AuthService {
  static async register(registerData) {
    const { name, email, password, phone, role } = registerData;

    // Verificar si el correo ya existe
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const err = new Error('El correo electrónico ya se encuentra registrado.');
      err.statusCode = 400;
      throw err;
    }

    // Encriptación bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserción SQL en PostgreSQL
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, passwordHash, phone, role]
    );

    const user = result.rows[0];
    const token = JwtService.generateToken(user);

    return { token, user };
  }

  static async login(loginData) {
    const { email, password } = loginData;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      const err = new Error('Credenciales inválidas (email o contraseña incorrectos).');
      err.statusCode = 401;
      throw err;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const err = new Error('Credenciales inválidas (email o contraseña incorrectos).');
      err.statusCode = 401;
      throw err;
    }

    const token = JwtService.generateToken(user);
    delete user.password_hash;

    return { token, user };
  }

  static async getUserProfile(userId) {
    const result = await db.query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const err = new Error('Usuario no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }
}

module.exports = AuthService;
