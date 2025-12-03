const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');
const { verifyCharacterOwnership } = require('../middleware/ownershipMiddleware');
const { uploadCharacterAvatar } = require('../middleware/uploadMiddleware');
const { validate, schemas } = require('../middleware/validator');

// Create a new character
router.post(
  '/',
  authenticate,
  uploadCharacterAvatar,
  validate(schemas.createCharacter),
  characterController.createCharacter
);

// Get all characters
router.get(
  '/',
  optionalAuthenticate,
  validate(schemas.getCharacters),
  characterController.getAllCharacters
);

// Get my created characters
router.get(
  '/my/created',
  authenticate,
  characterController.getMyCharacters
);

// Search characters
router.get(
  '/search',
  optionalAuthenticate,
  characterController.searchCharacters
);

// Get character by ID
router.get(
  '/:id',
  optionalAuthenticate,
  validate(schemas.mongoId),
  characterController.getCharacterById
);

// Update character
router.put(
  '/:id',
  authenticate,
  verifyCharacterOwnership,
  uploadCharacterAvatar,
  validate({
    params: schemas.mongoId.params,
    body: schemas.updateCharacter.body
  }),
  characterController.updateCharacter
);

// Delete character
router.delete(
  '/:id',
  authenticate,
  verifyCharacterOwnership,
  validate(schemas.mongoId),
  characterController.deleteCharacter
);

module.exports = router;
