const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Lectura de inventario accesible para todos los usuarios autenticados
router.get('/', verifyToken, inventoryController.getInventory);
router.get('/:id', verifyToken, inventoryController.getInventoryById);

// Modificaciones solo accesibles para Admins y Técnicos
router.post('/', verifyToken, authorizeRoles('admin', 'technician'), inventoryController.createInventory);
router.put('/:id', verifyToken, authorizeRoles('admin', 'technician'), inventoryController.updateInventory);
router.delete('/:id', verifyToken, authorizeRoles('admin'), inventoryController.deleteInventory);

module.exports = router;
