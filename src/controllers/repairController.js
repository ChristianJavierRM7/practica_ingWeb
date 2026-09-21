const RepairService = require('../services/repairService');
const RepairDto = require('../dto/repairDto');

const getRepairs = async (req, res, next) => {
  try {
    const { status, q, customer_id, technician_id } = req.query;
    const repairs = await RepairService.getRepairs(
      { status, search: q, customer_id, technician_id },
      req.user
    );

    return res.json({
      success: true,
      count: repairs.length,
      repairs,
    });
  } catch (error) {
    next(error);
  }
};

const getRepairById = async (req, res, next) => {
  try {
    const repair = await RepairService.getRepairById(req.params.id, req.user);
    return res.json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

const createRepair = async (req, res, next) => {
  try {
    const validation = RepairDto.validateCreate(req.body, req.user.role, req.user.id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación al crear orden de reparación.',
        errors: validation.errors,
      });
    }

    const repair = await RepairService.createRepair(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Orden de reparación creada exitosamente.',
      repair,
    });
  } catch (error) {
    next(error);
  }
};

const updateRepair = async (req, res, next) => {
  try {
    const repair = await RepairService.updateRepair(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Orden de reparación actualizada exitosamente.',
      repair,
    });
  } catch (error) {
    next(error);
  }
};

const updateRepairStatus = async (req, res, next) => {
  try {
    const validation = RepairDto.validateStatusUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
      });
    }

    const repair = await RepairService.updateStatus(req.params.id, validation.data.status);

    return res.json({
      success: true,
      message: `El estado de la orden ha sido actualizado a "${validation.data.status}".`,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

const addRepairItem = async (req, res, next) => {
  try {
    const { inventory_id, quantity } = req.body;
    if (!inventory_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del repuesto o servicio (inventory_id) es obligatorio.',
      });
    }

    const result = await RepairService.addRepairItem(req.params.id, inventory_id, quantity);

    return res.status(201).json({
      success: true,
      message: 'Repuesto/Servicio añadido exitosamente.',
      addedItem: result.addedItem,
      orderFinalCost: result.orderFinalCost,
    });
  } catch (error) {
    next(error);
  }
};

const removeRepairItem = async (req, res, next) => {
  try {
    const result = await RepairService.removeRepairItem(req.params.id, req.params.itemId);

    return res.json({
      success: true,
      message: 'Ítem removido de la orden de reparación.',
      orderFinalCost: result.orderFinalCost,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRepair = async (req, res, next) => {
  try {
    const deletedRepair = await RepairService.deleteRepair(req.params.id);

    return res.json({
      success: true,
      message: 'Orden de reparación eliminada exitosamente.',
      deletedRepair,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  updateRepairStatus,
  addRepairItem,
  removeRepairItem,
  deleteRepair,
};
