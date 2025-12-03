const ChatSession = require('../models/ChatSession');
const Character = require('../models/Character');
const openrouterService = require('./openrouterService');
const logger = require('../utils/logger');

/**
 * Create a new chat session
 * @param {string} userId - The user's ID
 * @param {string} characterId - The character's ID
 * @returns {Promise<Object>} The created chat session
 */
const createChatSession = async (userId, characterId) => {
  try {
    // Verify character exists
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check if user has access to this character
    if (!character.isPublic && character.creatorId.toString() !== userId) {
      throw new Error('You do not have access to this character');
    }

    // Create chat session
    const chatSession = new ChatSession({
      userId,
      characterId
    });

    await chatSession.save();

    // Update character popularity
    await Character.findByIdAndUpdate(characterId, {
      $inc: { popularity: 1 }
    });

    logger.info(`Chat session created: ${chatSession._id} for user ${userId} with character ${characterId}`);

    return chatSession;
  } catch (error) {
    logger.error(`Error creating chat session: ${error.message}`);
    throw error;
  }
};

/**
 * Send a message and get AI response
 * @param {string} userId - The user's ID
 * @param {string} characterId - The character's ID
 * @param {string} message - The user's message
 * @returns {Promise<Object>} The AI response with character info
 */
const sendMessage = async (userId, characterId, message) => {
  try {
    // Get character details
    const character = await Character.findById(characterId).populate('categoryId');
    if (!character) {
      throw new Error('Character not found');
    }

    // Check if user has access to this character
    if (!character.isPublic && character.creatorId.toString() !== userId) {
      throw new Error('You do not have access to this character');
    }

    // Check if a chat session exists, if not create one
    let chatSession = await ChatSession.findOne({ userId, characterId });
    if (!chatSession) {
      chatSession = await createChatSession(userId, characterId);
    }

    // Send message to OpenRouter API
    const aiResponse = await openrouterService.sendMessage(
      message,
      character.prompt,
      character.name
    );

    logger.info(`Message sent and response received for character ${character.name}`);

    return {
      response: aiResponse,
      characterName: character.name,
      characterAvatar: character.avatar,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    throw error;
  }
};

/**
 * Get all chat sessions for a user
 * @param {string} userId - The user's ID
 * @param {string} characterId - Optional character ID to filter by
 * @returns {Promise<Array>} Array of chat sessions with character details
 */
const getChatSessions = async (userId, characterId = null) => {
  try {
    const query = { userId };
    if (characterId) {
      query.characterId = characterId;
    }

    const sessions = await ChatSession.find(query)
      .populate({
        path: 'characterId',
        select: 'name avatar prompt categoryId isPublic'
      })
      .sort({ createdAt: -1 });

    // Format the response
    const formattedSessions = sessions.map(session => ({
      sessionId: session._id,
      characterId: session.characterId._id,
      characterName: session.characterId.name,
      characterAvatar: session.characterId.avatar,
      createdAt: session.createdAt
    }));

    logger.info(`Retrieved ${formattedSessions.length} chat sessions for user ${userId}`);

    return formattedSessions;
  } catch (error) {
    logger.error(`Error getting chat sessions: ${error.message}`);
    throw error;
  }
};

/**
 * Get total session count for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} Total number of chat sessions
 */
const getSessionCount = async (userId) => {
  try {
    const count = await ChatSession.countDocuments({ userId });
    logger.info(`User ${userId} has ${count} chat sessions`);
    return count;
  } catch (error) {
    logger.error(`Error getting session count: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a chat session
 * @param {string} sessionId - The session ID
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
const deleteChatSession = async (sessionId, userId) => {
  try {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    
    if (!session) {
      throw new Error('Chat session not found or you do not have permission to delete it');
    }

    await ChatSession.findByIdAndDelete(sessionId);

    logger.info(`Chat session ${sessionId} deleted by user ${userId}`);
  } catch (error) {
    logger.error(`Error deleting chat session: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createChatSession,
  sendMessage,
  getChatSessions,
  getSessionCount,
  deleteChatSession
};
