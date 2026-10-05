const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/stats', authorizeRoles('admin', 'technician'), dashboardController.getDashboardStats);

module.exports = router;
