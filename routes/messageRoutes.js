const express = require('express');
const router = express.Router();
const Message = require('../model/Message');
const Conversation = require('../model/Conversation');
const authMiddleware = require('../MiddleWares/authMiddleWare');

// Get messages for a conversation
router.get('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ conversation: req.params.conversationId });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send a message in a conversation
router.post('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        const message = new Message({
            sender: req.user.userId,
            content,
            conversation: req.params.conversationId
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Mark a message as read
router.post('/:messageId/read', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        message.readBy.push(req.user.userId);
        await message.save();
        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a message
router.delete('/:messageId', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        await message.remove();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get unread messages for a conversation
router.get('/:conversationId/unread', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ 
            conversation: req.params.conversationId, 
            readBy: { $ne: req.user.userId } 
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get messages sent by a specific user in a conversation
router.get('/:conversationId/user/:userId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ 
            conversation: req.params.conversationId, 
            sender: req.params.userId 
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get the last message in a conversation
router.get('/:conversationId/last', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findOne({ conversation: req.params.conversationId }).sort({ createdAt: -1 });
        res.status(200).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get messages in a conversation with pagination
router.get('/:conversationId/paginated', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const messages = await Message.find({ conversation: req.params.conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get messages in a conversation sorted by creation date
router.get('/:conversationId/sorted', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;