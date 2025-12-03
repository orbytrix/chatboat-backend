const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validator');

// Start a new chat session
router.post(
  '/sessions',
  authenticate,
  chatLimiter,
  validate(schemas.startChatSession),
  chatController.startChatSession
);

// Send a message to a character
router.post(
  '/message',
  authenticate,
  chatLimiter,
  validate(schemas.sendMessage),
  chatController.sendMessage
);

// Get chat sessions
router.get(
  '/sessions',
  authenticate,
  validate(schemas.getChatSessions),
  chatController.getChatSessions
);

// Get session count
router.get(
  '/sessions/count',
  authenticate,
  chatController.getSessionCount
);

// Delete chat session
router.delete(
  '/sessions/:id',
  authenticate,
  validate(schemas.mongoId),
  chatController.deleteChatSession
);

module.exports = router;
