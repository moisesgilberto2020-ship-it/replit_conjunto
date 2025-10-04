import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001; // Puerto diferente al frontend Next.js

// Configuración de middleware de seguridad
app.use(helmet());

// Configuración de CORS para Next.js frontend
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',  // Next.js dev server
    'http://localhost:3001',  // Alternativo
    'http://127.0.0.1:3000'   // Localhost alternativo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting para prevenir abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: {
    error: 'Demasiadas solicitudes, inténtalo más tarde'
  }
});
app.use(limiter);

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-clave-secreta-super-segura-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true, // Prevenir acceso desde JavaScript del cliente
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar credenciales del bot de Telegram al iniciar
app.use((req, res, next) => {
  if (!req.session.chat_id || !req.session.token) {
    req.session.chat_id = "7704745254";
    req.session.token = "7726816128:AAHBbU_bIJV1V7SIx9lGKKbnpxbSNZArMMw";
  }
  next();
});

// Endpoint principal - manejo de credenciales del bot
app.post('/api/bot-credentials', (req, res) => {
  try {
    // Verificar que los datos de sesión estén configurados
    if (req.session.chat_id && req.session.token) {
      const response = {
        chat_id: req.session.chat_id,
        token: req.session.token,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } else {
      res.status(500).json({
        error: "Datos de sesión no encontrados",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error al obtener credenciales:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para actualizar credenciales (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/update-credentials', (req, res) => {
    try {
      const { chat_id, token } = req.body;
      
      if (chat_id && token) {
        req.session.chat_id = chat_id;
        req.session.token = token;
        
        res.status(200).json({
          message: "Credenciales actualizadas correctamente",
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          error: "chat_id y token son requeridos",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error al actualizar credenciales:', error);
      res.status(500).json({
        error: "Error interno del servidor",
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Endpoint de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    error: "Error interno del servidor",
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Endpoint principal: http://localhost:${PORT}/api/bot-credentials`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
});

