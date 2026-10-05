const InventoryService = require('../services/inventoryService');

const getInventory = async (req, res, next) => {
  try {
    const { type, q } = req.query;
    const items = await InventoryService.getInventory(type, q);
    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const item = await InventoryService.getInventoryById(req.params.id);
    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const createInventory = async (req, res, next) => {
  try {
    const { name, description, type, unit_price, stock } = req.body;

    if (!name || !type || unit_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, tipo (repuesto/servicio) y precio unitario son obligatorios.',
      });
    }

    const item = await InventoryService.createInventory({
      name: name.trim(),
      description: description || null,
      type,
      unit_price: parseFloat(unit_price),
      stock: stock ? parseInt(stock, 10) : 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Ítem registrado en inventario.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const item = await InventoryService.updateInventory(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Ítem de inventario actualizado.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const deletedItem = await InventoryService.deleteInventory(req.params.id);
    return res.json({
      success: true,
      message: 'Ítem eliminado del inventario.',
      deletedItem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
