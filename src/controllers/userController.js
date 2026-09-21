const UserService = require('../services/userService');
const AuthDto = require('../dto/authDto');

const getUsers = async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const users = await UserService.getUsers(role, q);
    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const validation = AuthDto.validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación al crear usuario.',
        errors: validation.errors,
      });
    }

    const user = await UserService.createUser(validation.data);
    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Usuario actualizado exitosamente.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await UserService.deleteUser(req.params.id, req.user.id);
    return res.json({
      success: true,
      message: 'Usuario eliminado exitosamente.',
      deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
