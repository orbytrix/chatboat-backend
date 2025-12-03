const app = require('../app');
const { connectDB } = require('./config/database');
const { logCloudinaryStatus } = require('./config/cloudinary');
const logger = require('./utils/logger');

/**
 * Initialize application
 * Connects to database and starts the server
 */
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Database connection established successfully');

    // Log configuration status
    logCloudinaryStatus();

    // Get port from environment or use default
    const PORT = process.env.PORT || 3000;

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Export for use in server.js
module.exports = initializeApp;
