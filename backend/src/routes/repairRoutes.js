const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Consulta de órdenes
router.get('/', repairController.getRepairs);
router.get('/:id', repairController.getRepairById);

// Creación de orden (Clientes pueden registrar su celular, Admins/Técnicos también)
router.post('/', repairController.createRepair);

// Edición general y cambio de estado (Admins y Técnicos)
router.put('/:id', authorizeRoles('admin', 'technician'), repairController.updateRepair);
router.patch('/:id/status', authorizeRoles('admin', 'technician'), repairController.updateRepairStatus);

// Gestión de ítems (Repuestos/Servicios) agregados a la orden
router.post('/:id/items', authorizeRoles('admin', 'technician'), repairController.addRepairItem);
router.delete('/:id/items/:itemId', authorizeRoles('admin', 'technician'), repairController.removeRepairItem);

// Cancelar / Eliminar Orden (Admin)
router.delete('/:id', authorizeRoles('admin'), repairController.deleteRepair);

module.exports = router;
