const Character = require('../models/Character');
const Category = require('../models/Category');
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Analytics Service
 * Provides business logic for analytics and monitoring
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

/**
 * Get character usage statistics
 * Returns character names with their session counts and popularity
 * Requirement: 13.1
 */
const getCharacterStatistics = async () => {
  try {
    // Aggregate chat sessions by character
    const sessionStats = await ChatSession.aggregate([
      {
        $group: {
          _id: '$characterId',
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup
    const sessionMap = {};
    sessionStats.forEach(stat => {
      sessionMap[stat._id.toString()] = stat.sessionCount;
    });

    // Get all characters with their details
    const characters = await Character.find()
      .populate('categoryId', 'name')
      .populate('creatorId', 'name email')
      .select('name avatar popularity categoryId creatorId isPublic createdAt');

    // Combine character data with session counts
    const statistics = characters.map(character => ({
      characterId: character._id,
      characterName: character.name,
      avatar: character.avatar,
      category: character.categoryId ? character.categoryId.name : 'Unknown',
      creator: character.creatorId ? character.creatorId.name : 'Unknown',
      isPublic: character.isPublic,
      sessionCount: sessionMap[character._id.toString()] || 0,
      popularity: character.popularity,
      createdAt: character.createdAt
    }));

    // Sort by session count descending
    statistics.sort((a, b) => b.sessionCount - a.sessionCount);

    logger.info('Character statistics retrieved successfully');
    return statistics;
  } catch (error) {
    logger.error('Error getting character statistics:', error);
    throw error;
  }
};

/**
 * Get category popularity metrics
 * Returns categories with character counts and total chat sessions
 * Requirement: 13.2
 */
const getCategoryPopularity = async () => {
  try {
    // Get all categories
    const categories = await Category.find();

    // Get character counts per category
    const characterCounts = await Character.aggregate([
      {
        $group: {
          _id: '$categoryId',
          characterCount: { $sum: 1 },
          publicCharacterCount: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          }
        }
      }
    ]);

    // Get total chat sessions per category
    const chatStats = await ChatSession.aggregate([
      {
        $lookup: {
          from: 'characters',
          localField: 'characterId',
          foreignField: '_id',
          as: 'character'
        }
      },
      {
        $unwind: '$character'
      },
      {
        $group: {
          _id: '$character.categoryId',
          totalChats: { $sum: 1 }
        }
      }
    ]);

    // Create maps for quick lookup
    const characterCountMap = {};
    characterCounts.forEach(stat => {
      characterCountMap[stat._id.toString()] = {
        characterCount: stat.characterCount,
        publicCharacterCount: stat.publicCharacterCount
      };
    });

    const chatCountMap = {};
    chatStats.forEach(stat => {
      chatCountMap[stat._id.toString()] = stat.totalChats;
    });

    // Combine data
    const popularity = categories.map(category => {
      const categoryId = category._id.toString();
      const charStats = characterCountMap[categoryId] || { characterCount: 0, publicCharacterCount: 0 };
      const totalChats = chatCountMap[categoryId] || 0;

      return {
        categoryId: category._id,
        categoryName: category.name,
        description: category.description,
        icon: category.icon,
        characterCount: charStats.characterCount,
        publicCharacterCount: charStats.publicCharacterCount,
        totalChats: totalChats,
        averageChatsPerCharacter: charStats.characterCount > 0 
          ? (totalChats / charStats.characterCount).toFixed(2) 
          : 0,
        createdAt: category.createdAt
      };
    });

    // Sort by total chats descending
    popularity.sort((a, b) => b.totalChats - a.totalChats);

    logger.info('Category popularity metrics retrieved successfully');
    return popularity;
  } catch (error) {
    logger.error('Error getting category popularity:', error);
    throw error;
  }
};

/**
 * Get user engagement data
 * Returns active user counts and engagement metrics
 * Requirement: 13.3
 */
const getUserEngagement = async () => {
  try {
    // Get total user count
    const totalUsers = await User.countDocuments();
    
    // Get active users count (users who are active)
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get users with at least one chat session
    const usersWithChats = await ChatSession.distinct('userId');
    const engagedUserCount = usersWithChats.length;

    // Get total chat sessions
    const totalSessions = await ChatSession.countDocuments();

    // Calculate average sessions per user
    const averageSessionsPerUser = engagedUserCount > 0 
      ? (totalSessions / engagedUserCount).toFixed(2) 
      : 0;

    // Get user registration stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get chat activity stats (last 30 days)
    const recentSessions = await ChatSession.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get users by auth provider
    const usersByProvider = await User.aggregate([
      {
        $group: {
          _id: '$authProvider',
          count: { $sum: 1 }
        }
      }
    ]);

    const providerStats = {};
    usersByProvider.forEach(stat => {
      providerStats[stat._id] = stat.count;
    });

    // Get most active users (top 10)
    const mostActiveUsers = await ChatSession.aggregate([
      {
        $group: {
          _id: '$userId',
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { sessionCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          sessionCount: 1,
          _id: 0
        }
      }
    ]);

    const engagement = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      engagedUserCount,
      engagementRate: totalUsers > 0 
        ? ((engagedUserCount / totalUsers) * 100).toFixed(2) + '%' 
        : '0%',
      totalSessions,
      averageSessionsPerUser: parseFloat(averageSessionsPerUser),
      newUsersLast30Days,
      recentSessionsLast30Days: recentSessions,
      usersByAuthProvider: providerStats,
      mostActiveUsers
    };

    logger.info('User engagement data retrieved successfully');
    return engagement;
  } catch (error) {
    logger.error('Error getting user engagement:', error);
    throw error;
  }
};

/**
 * Track API endpoint usage
 * This is a placeholder for future implementation with request logging
 * Requirement: 13.4
 */
const trackEndpointUsage = async () => {
  try {
    // This would typically integrate with request logging middleware
    // For now, return basic system stats
    const stats = {
      message: 'Endpoint usage tracking requires integration with request logging middleware',
      systemUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };

    logger.info('Endpoint usage tracking called');
    return stats;
  } catch (error) {
    logger.error('Error tracking endpoint usage:', error);
    throw error;
  }
};

module.exports = {
  getCharacterStatistics,
  getCategoryPopularity,
  getUserEngagement,
  trackEndpointUsage
};
