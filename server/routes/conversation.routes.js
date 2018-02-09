'use strict';

const Router = require('koa-router');
const router = new Router();

const conversationController = require('../controllers/conversationController');

/**
 * Conversation Logic Routes
 */
router.post('/incoming', conversationController.replyWithMessage)


module.exports = router;