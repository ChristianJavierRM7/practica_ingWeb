const AuthDto = require('../dto/authDto');
const AuthService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const validation = AuthDto.validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos ingresados.',
        errors: validation.errors,
      });
    }

    const { token, user } = await AuthService.register(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validation = AuthDto.validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en las credenciales.',
        errors: validation.errors,
      });
    }

    const { token, user } = await AuthService.login(validation.data);

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getUserProfile(req.user.id);
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
