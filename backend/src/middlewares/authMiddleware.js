const JwtService = require('../security/jwtService');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Token no proporcionado o formato inválido (Bearer <token>).',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtService.verifyToken(token);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token de autenticación ha expirado. Por favor inicia sesión de nuevo.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token inválido o alterado.',
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
