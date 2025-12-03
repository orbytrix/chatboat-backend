const chatService = require('../services/chatService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Start a new chat session
 * @route POST /api/chat/sessions
 */
const startChatSession = async (req, res, next) => {
  try {
    const { characterId } = req.body;
    const userId = req.user.id;

    if (!characterId) {
      return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Character ID is required'));
    }

    const session = await chatService.createChatSession(userId, characterId);

    res.status(201).json(successResponse({
      sessionId: session._id,
      characterId: session.characterId,
      userId: session.userId,
      createdAt: session.createdAt
    }));
  } catch (error) {
    logger.error(`Error in startChatSession: ${error.message}`);
    
    if (error.message === 'Character not found') {
      return res.status(404).json(errorResponse('NOT_FOUND', error.message));
    }
    
    if (error.message.includes('do not have access')) {
      return res.status(403).json(errorResponse('UNAUTHORIZED', error.message));
    }
    
    next(error);
  }
};

/**
 * Send a message to a character
 * @route POST /api/chat/message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { characterId, message } = req.body;
    const userId = req.user.id;

    if (!characterId || !message) {
      return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Character ID and message are required'));
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Message must be a non-empty string'));
    }

    const response = await chatService.sendMessage(userId, characterId, message);

    res.status(200).json(successResponse(response));
  } catch (error) {
    logger.error(`Error in sendMessage: ${error.message}`);
    
    if (error.message === 'Character not found') {
      return res.status(404).json(errorResponse('NOT_FOUND', error.message));
    }
    
    if (error.message.includes('do not have access')) {
      return res.status(403).json(errorResponse('UNAUTHORIZED', error.message));
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json(errorResponse('EXTERNAL_API_ERROR', error.message));
    }
    
    if (error.message.includes('AI service')) {
      return res.status(503).json(errorResponse('EXTERNAL_API_ERROR', error.message));
    }
    
    next(error);
  }
};

/**
 * Get all chat sessions for the authenticated user
 * @route GET /api/chat/sessions
 */
const getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.query;

    const sessions = await chatService.getChatSessions(userId, characterId);

    res.status(200).json(successResponse(sessions));
  } catch (error) {
    logger.error(`Error in getChatSessions: ${error.message}`);
    next(error);
  }
};

/**
 * Get total session count for the authenticated user
 * @route GET /api/chat/sessions/count
 */
const getSessionCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await chatService.getSessionCount(userId);

    res.status(200).json(successResponse({ totalSessions: count }));
  } catch (error) {
    logger.error(`Error in getSessionCount: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a chat session
 * @route DELETE /api/chat/sessions/:id
 */
const deleteChatSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Session ID is required'));
    }

    await chatService.deleteChatSession(id, userId);

    res.status(200).json(successResponse({ message: 'Chat session deleted successfully' }));
  } catch (error) {
    logger.error(`Error in deleteChatSession: ${error.message}`);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json(errorResponse('NOT_FOUND', error.message));
    }
    
    next(error);
  }
};

module.exports = {
  startChatSession,
  sendMessage,
  getChatSessions,
  getSessionCount,
  deleteChatSession
};
