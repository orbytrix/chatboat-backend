const axios = require('axios');
const { nvidiaConfig } = require('../config/nvidia');
const logger = require('../utils/logger');

/**
 * Send a message to NVIDIA API with character prompt
 * @param {string} userMessage - The user's message
 * @param {string} characterPrompt - The character's personality prompt
 * @param {string} characterName - The character's name
 * @returns {Promise<string>} The AI-generated response
 */
const sendMessage = async (userMessage, characterPrompt, characterName) => {
  const startTime = Date.now();
  
  try {
    logger.info(`Sending message to NVIDIA API for character: ${characterName}`);

    // Construct the system prompt with character personality
    const systemPrompt = `You are ${characterName}. ${characterPrompt}\n\nRespond to the user's message in character, maintaining the personality and traits described above.`;

    // Prepare the request payload
    const payload = {
      model: nvidiaConfig.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: nvidiaConfig.temperature,
      max_tokens: nvidiaConfig.maxTokens,
      top_p: 1,
      stream: false
    };

    // Make the API request with timeout
    const response = await axios.post(nvidiaConfig.apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${nvidiaConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: nvidiaConfig.timeout
    });

    const responseTime = Date.now() - startTime;
    logger.info(`NVIDIA API response received in ${responseTime}ms`);

    // Extract the response text
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const aiResponse = response.data.choices[0].message.content;
      
      logger.info(`AI response generated successfully for character: ${characterName}`);
      
      return aiResponse;
    } else {
      logger.error('Invalid response format from NVIDIA API');
      throw new Error('Invalid response format from NVIDIA API');
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logger.error(`NVIDIA API timeout after ${responseTime}ms`);
      throw new Error('AI service timeout - please try again');
    }

    if (error.response) {
      // API returned an error response
      logger.error(`NVIDIA API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      throw new Error(`AI service error: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request was made but no response received
      logger.error(`NVIDIA API no response: ${error.message}`);
      throw new Error('AI service unavailable - please try again later');
    } else {
      // Error in request setup
      logger.error(`NVIDIA API request error: ${error.message}`);
      throw new Error('Failed to communicate with AI service');
    }
  }
};

/**
 * Test NVIDIA API connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  try {
    logger.info('Testing NVIDIA API connection...');
    
    const response = await sendMessage(
      'Hello',
      'You are a friendly assistant.',
      'Test Assistant'
    );
    
    logger.info('NVIDIA API connection test successful');
    return true;
  } catch (error) {
    logger.error(`NVIDIA API connection test failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendMessage,
  testConnection
};
