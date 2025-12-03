require('dotenv').config();
const initializeApp = require('./src/index');
const { disconnectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// Initialize and start the application
let server;

initializeApp()
  .then((appServer) => {
    server = appServer;
    logger.info('Application started successfully');
  })
  .catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

// Handle SIGTERM signal (e.g., from Kubernetes, Docker)
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  gracefulShutdown('SIGTERM');
});

// Handle SIGINT signal (e.g., Ctrl+C)
process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  gracefulShutdown('SIGINT');
});

/**
 * Graceful shutdown handler
 * Closes server and database connections before exiting
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connection
        await disconnectDB();
        logger.info('Database connection closed');
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    // If server hasn't started yet, just exit
    try {
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      logger.error('Error closing database:', error);
      process.exit(1);
    }
  }
}
