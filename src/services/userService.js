const bcrypt = require('bcryptjs');
const db = require('../config/db');

class UserService {
  static async getUsers(role, search) {
    let queryText = 'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      queryText += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY id DESC';
    const result = await db.query(queryText, params);
    return result.rows;
  }

  static async getUserById(id) {
    const result = await db.query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const err = new Error('Usuario no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async createUser(userData) {
    const { name, email, password, phone, role } = userData;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, passwordHash, phone, role]
    );

    return result.rows[0];
  }

  static async updateUser(id, updateData) {
    const check = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const err = new Error('Usuario no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const current = check.rows[0];
    let passwordHash = current.password_hash;

    if (updateData.password && updateData.password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(updateData.password, salt);
    }

    const updatedName = updateData.name !== undefined ? updateData.name.trim() : current.name;
    const updatedEmail = updateData.email !== undefined ? updateData.email.toLowerCase().trim() : current.email;
    const updatedPhone = updateData.phone !== undefined ? updateData.phone : current.phone;
    const updatedRole = updateData.role !== undefined ? updateData.role : current.role;

    const result = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, role = $4, password_hash = $5
       WHERE id = $6
       RETURNING id, name, email, phone, role, updated_at`,
      [updatedName, updatedEmail, updatedPhone, updatedRole, passwordHash, id]
    );

    return result.rows[0];
  }

  static async deleteUser(id, currentUserId) {
    if (parseInt(id, 10) === currentUserId) {
      const err = new Error('No puedes eliminar tu propia cuenta en sesión.');
      err.statusCode = 400;
      throw err;
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);
    if (result.rows.length === 0) {
      const err = new Error('Usuario no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }
}

module.exports = UserService;
