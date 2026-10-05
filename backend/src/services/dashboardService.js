const db = require('../config/db');

class DashboardService {
  static async getDashboardStats() {
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
        COUNT(CASE WHEN role = 'technician' THEN 1 END) as total_technicians,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
      FROM users
    `);

    const repairStats = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'recibido' THEN 1 END) as total_recibido,
        COUNT(CASE WHEN status = 'en_diagnostico' THEN 1 END) as total_en_diagnostico,
        COUNT(CASE WHEN status = 'en_reparacion' THEN 1 END) as total_en_reparacion,
        COUNT(CASE WHEN status = 'listo' THEN 1 END) as total_listo,
        COUNT(CASE WHEN status = 'entregado' THEN 1 END) as total_entregado,
        COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as total_cancelado,
        COALESCE(SUM(CASE WHEN status = 'entregado' THEN final_cost ELSE 0 END), 0.00) as total_revenue
      FROM repair_orders
    `);

    const lowStock = await db.query(`
      SELECT id, name, type, unit_price, stock 
      FROM inventory 
      WHERE type = 'repuesto' AND stock <= 5
      ORDER BY stock ASC
    `);

    return {
      users: userStats.rows[0],
      repairs: repairStats.rows[0],
      lowStockItems: lowStock.rows,
    };
  }
}

module.exports = DashboardService;
