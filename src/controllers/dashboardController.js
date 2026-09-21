const DashboardService = require('../services/dashboardService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
