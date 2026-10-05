const errorHandler = (err, req, res, next) => {
  console.error('❌ Error capturado en API:', err);

  // PostgreSQL Error Codes Comunes
  if (err.code === '23505') {
    // Unique violation (email duplicado, order_number duplicado)
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe en el sistema (Violación de restricción única).',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Referencia a ID no existente en la base de datos (Violación de clave foránea).',
      detail: err.detail,
    });
  }

  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({
      success: false,
      message: 'Los datos proporcionados no cumplen con las reglas de validación de la base de datos.',
      detail: err.detail,
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
