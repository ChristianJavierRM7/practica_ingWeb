const db = require('../config/db');

class InventoryService {
  static async getInventory(type, search) {
    let queryText = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (type) {
      params.push(type);
      queryText += ` AND type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY id DESC';
    const result = await db.query(queryText, params);
    return result.rows;
  }

  static async getInventoryById(id) {
    const result = await db.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const err = new Error('Ítem de inventario no encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return result.rows[0];
  }

  static async createInventory(data) {
    const { name, description, type, unit_price, stock } = data;

    const result = await db.query(
      `INSERT INTO inventory (name, description, type, unit_price, stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, type, unit_price, stock]
    );

    return result.rows[0];
  }

  static async updateInventory(id, data) {
    const check = await db.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const err = new Error('Ítem de inventario no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const current = check.rows[0];

    const updatedName = data.name !== undefined ? data.name : current.name;
    const updatedDesc = data.description !== undefined ? data.description : current.description;
    const updatedType = data.type !== undefined ? data.type : current.type;
    const updatedPrice = data.unit_price !== undefined ? parseFloat(data.unit_price) : current.unit_price;
    const updatedStock = data.stock !== undefined ? parseInt(data.stock, 10) : current.stock;

    const result = await db.query(
      `UPDATE inventory 
       SET name = $1, description = $2, type = $3, unit_price = $4, stock = $5
       WHERE id = $6
       RETURNING *`,
      [updatedName, updatedDesc, updatedType, updatedPrice, updatedStock, id]
    );

    return result.rows[0];
  }

  static async deleteInventory(id) {
    const result = await db.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      const err = new Error('Ítem de inventario no encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return result.rows[0];
  }
}

module.exports = InventoryService;
