const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: true
  },
  avatarPublicId: {
    type: String,
    default: null
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 5000,
    validate: {
      validator: function(v) {
        return v.length <= 5000;
      },
      message: 'Prompt cannot exceed 5000 characters'
    }
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
characterSchema.index({ categoryId: 1 });
characterSchema.index({ creatorId: 1 });
characterSchema.index({ isPublic: 1 });

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;
