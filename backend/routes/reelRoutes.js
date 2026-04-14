const express = require('express');
const { getReels } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getReels);

module.exports = router;
