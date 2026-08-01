const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: "Too many chat requests."
});

router.post('/chat', chatLimiter, aiController.handleChat.bind(aiController));

module.exports = router;
