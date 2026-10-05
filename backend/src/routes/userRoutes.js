const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Todas las rutas de gestión de usuarios requieren autenticación y rol 'admin' o 'technician'
router.use(verifyToken);

router.get('/', authorizeRoles('admin', 'technician'), userController.getUsers);
router.get('/:id', authorizeRoles('admin', 'technician'), userController.getUserById);
router.post('/', authorizeRoles('admin'), userController.createUser);
router.put('/:id', authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
