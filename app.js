const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const characterRoutes = require('./src/routes/characterRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const preferencesRoutes = require('./src/routes/preferencesRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Create Express app
const app = express();

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for iOS app
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, you should specify allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : [];
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Request logging middleware with Morgan
// Create a stream object with a 'write' function that will be used by Morgan
const morganStream = {
  write: (message) => {
    // Remove trailing newline and log with Winston
    logger.info(message.trim());
  }
};

// Morgan configuration - different formats for development and production
if (process.env.NODE_ENV === 'production') {
  // Production: Combined format with response time
  app.use(morgan('combined', { stream: morganStream }));
} else {
  // Development: More detailed format with colors
  app.use(morgan('dev'));
  
  // Also log to Winston in development for consistency
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { 
    stream: morganStream 
  }));
}

// Additional custom logging for detailed metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log detailed request information to Winston
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      contentLength: res.get('content-length') || 0
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  };
  
  res.status(200).json(healthCheck);
});

// API Documentation removed - Use Postman collection instead

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot Backend API',
    version: '1.0.0',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      characters: '/api/characters',
      chat: '/api/chat',
      favorites: '/api/favorites',
      preferences: '/api/preferences',
      analytics: '/api/analytics'
    }
  });
});

// Handle 404 - Route not found
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
