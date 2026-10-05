const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Rutas API Backend
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const repairRoutes = require('./routes/repairRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globales de Seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Permitir carga de recursos estáticos en entorno local
}));
app.use(cors());
app.use(express.json());

// Endpoint de Salud (Health check)
app.get('/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as now');
    res.json({
      status: 'UP',
      database: 'Connected to PostgreSQL',
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: err.message,
    });
  }
});

// Definición de Rutas API REST del Servidor
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejador de Rutas No Encontradas (404)
app.use((req, res) => {
  const message = req.originalUrl.startsWith('/api')
    ? `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`
    : `Ruta no encontrada: ${req.method} ${req.originalUrl}`;

  res.status(404).json({
    success: false,
    message,
  });
});

// Middleware Global de Manejo de Errores
app.use(errorHandler);

// Iniciar Servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 API REST TechFix iniciada`);
    console.log(`🖥️  Backend API:                      http://localhost:${PORT}/api`);
    console.log(`📊 Endpoint de Salud DB:              http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
