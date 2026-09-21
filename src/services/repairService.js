const db = require('../config/db');

class RepairService {
  static async recalculateFinalCost(repairOrderId) {
    const sumResult = await db.query(
      'SELECT COALESCE(SUM(subtotal), 0.00) as total FROM repair_items WHERE repair_order_id = $1',
      [repairOrderId]
    );
    const total = parseFloat(sumResult.rows[0].total);

    await db.query(
      'UPDATE repair_orders SET final_cost = $1 WHERE id = $2',
      [total, repairOrderId]
    );

    return total;
  }

  static async getRepairs(filters, user) {
    const { status, search, customer_id, technician_id } = filters;

    let queryText = `
      SELECT ro.*, 
             c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
             t.name as technician_name
      FROM repair_orders ro
      JOIN users c ON ro.customer_id = c.id
      LEFT JOIN users t ON ro.technician_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (user.role === 'customer') {
      params.push(user.id);
      queryText += ` AND ro.customer_id = $${params.length}`;
    } else if (customer_id) {
      params.push(customer_id);
      queryText += ` AND ro.customer_id = $${params.length}`;
    }

    if (technician_id) {
      params.push(technician_id);
      queryText += ` AND ro.technician_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND ro.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (ro.order_number ILIKE $${params.length} OR ro.device_brand ILIKE $${params.length} OR ro.device_model ILIKE $${params.length} OR ro.serial_imei ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY ro.id DESC';
    const result = await db.query(queryText, params);
    return result.rows;
  }

  static async getRepairById(id, user) {
    const orderResult = await db.query(
      `SELECT ro.*, 
              c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              t.name as technician_name, t.email as technician_email
       FROM repair_orders ro
       JOIN users c ON ro.customer_id = c.id
       LEFT JOIN users t ON ro.technician_id = t.id
       WHERE ro.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      const err = new Error('Orden de reparación no encontrada.');
      err.statusCode = 404;
      throw err;
    }

    const repair = orderResult.rows[0];

    if (user.role === 'customer' && repair.customer_id !== user.id) {
      const err = new Error('No tienes permiso para consultar esta orden.');
      err.statusCode = 403;
      throw err;
    }

    const itemsResult = await db.query(
      `SELECT ri.id, ri.repair_order_id, ri.inventory_id, ri.quantity, ri.unit_price, ri.subtotal,
              inv.name as item_name, inv.type as item_type, inv.description as item_description
       FROM repair_items ri
       JOIN inventory inv ON ri.inventory_id = inv.id
       WHERE ri.repair_order_id = $1
       ORDER BY ri.id ASC`,
      [id]
    );

    repair.items = itemsResult.rows;
    return repair;
  }

  static async createRepair(repairData) {
    const {
      customer_id,
      technician_id,
      device_brand,
      device_model,
      serial_imei,
      fault_description,
      estimated_cost,
      repair_notes,
    } = repairData;

    const year = new Date().getFullYear();
    const countResult = await db.query('SELECT COUNT(*) FROM repair_orders');
    const nextNum = parseInt(countResult.rows[0].count, 10) + 1;
    const orderNumber = `REP-${year}-${String(nextNum).padStart(3, '0')}`;

    const result = await db.query(
      `INSERT INTO repair_orders 
       (order_number, customer_id, technician_id, device_brand, device_model, serial_imei, fault_description, status, estimated_cost, final_cost, repair_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'recibido', $8, 0.00, $9)
       RETURNING *`,
      [
        orderNumber,
        customer_id,
        technician_id || null,
        device_brand,
        device_model,
        serial_imei || null,
        fault_description,
        estimated_cost,
        repair_notes || null,
      ]
    );

    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE repair_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      const err = new Error('Orden de reparación no encontrada.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async addRepairItem(repairId, inventoryId, quantity) {
    const qty = quantity && parseInt(quantity, 10) > 0 ? parseInt(quantity, 10) : 1;

    const orderCheck = await db.query('SELECT id FROM repair_orders WHERE id = $1', [repairId]);
    if (orderCheck.rows.length === 0) {
      const err = new Error('Orden de reparación no encontrada.');
      err.statusCode = 404;
      throw err;
    }

    const invCheck = await db.query('SELECT * FROM inventory WHERE id = $1', [inventoryId]);
    if (invCheck.rows.length === 0) {
      const err = new Error('El ítem de inventario no existe.');
      err.statusCode = 404;
      throw err;
    }

    const item = invCheck.rows[0];

    if (item.type === 'repuesto') {
      if (item.stock < qty) {
        const err = new Error(`Stock insuficiente para "${item.name}". Disponible: ${item.stock}`);
        err.statusCode = 400;
        throw err;
      }
      await db.query('UPDATE inventory SET stock = stock - $1 WHERE id = $2', [qty, inventoryId]);
    }

    const newItem = await db.query(
      `INSERT INTO repair_items (repair_order_id, inventory_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [repairId, inventoryId, qty, item.unit_price]
    );

    const orderFinalCost = await this.recalculateFinalCost(repairId);

    return {
      addedItem: newItem.rows[0],
      orderFinalCost,
    };
  }

  static async removeRepairItem(repairId, itemId) {
    const itemCheck = await db.query(
      `SELECT ri.*, inv.type 
       FROM repair_items ri
       JOIN inventory inv ON ri.inventory_id = inv.id
       WHERE ri.id = $1 AND ri.repair_order_id = $2`,
      [itemId, repairId]
    );

    if (itemCheck.rows.length === 0) {
      const err = new Error('El ítem no fue encontrado en esta orden.');
      err.statusCode = 404;
      throw err;
    }

    const targetItem = itemCheck.rows[0];

    if (targetItem.type === 'repuesto') {
      await db.query('UPDATE inventory SET stock = stock + $1 WHERE id = $2', [
        targetItem.quantity,
        targetItem.inventory_id,
      ]);
    }

    await db.query('DELETE FROM repair_items WHERE id = $1', [itemId]);
    const orderFinalCost = await this.recalculateFinalCost(repairId);

    return { orderFinalCost };
  }

  static async deleteRepair(id) {
    const result = await db.query('DELETE FROM repair_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      const err = new Error('Orden de reparación no encontrada.');
      err.statusCode = 404;
      throw err;
    }
    return result.rows[0];
  }
}

module.exports = RepairService;
