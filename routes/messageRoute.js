// const express = require('express');
// const router = express.Router();
// const Message = require('../model/Message');
// const Conversation = require('../model/Conversation');
// const authMiddleware = require('../MiddleWares/authMiddleWare');

// // Get messages for a conversation
// router.get('/:conversationId', authMiddleware, async (req, res) => {
//     try {
//         const messages = await Message.find({ conversation: req.params.conversationId });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Send a message in a conversation
// router.post('/:conversationId', authMiddleware, async (req, res) => {
//     try {
//         const { content } = req.body;
//         const conversation = await Conversation.findById(req.params.conversationId);
//         if (!conversation) {
//             return res.status(404).json({ message: 'Conversation not found' });
//         }
//         const message = new Message({
//             sender: req.user.userId,
//             content,
//             conversation: req.params.conversationId
//         });
//         await message.save();
//         res.status(201).json(message);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Mark a message as read
// router.post('/:messageId/read', authMiddleware, async (req, res) => {
//     try {
//         const message = await Message.findById(req.params.messageId);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         message.isRead = true;
//         await message.save();
//         res.status(200).json({ message: 'Message marked as read' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Delete a message
// router.delete('/:messageId', authMiddleware, async (req, res) => {
//     try {
//         const message = await Message.findById(req.params.messageId);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }
//         await message.remove();
//         res.status(200).json({ message: 'Message deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
// // Get unread messages for a conversation
// router.get('/:conversationId/unread', authMiddleware, async (req, res) => {
//     try {
//         const messages = await Message.find({ conversation: req.params.conversationId, isRead: false });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages sent by a specific user in a conversation
// router.get('/:conversationId/user/:userId', authMiddleware, async (req, res) => {
//     try {        const messages = await Message.find({ conversation: req.params.conversationId, sender: req.params.userId });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get the last message in a conversation
// router.get('/:conversationId/last', authMiddleware, async (req, res) => {
//     try {
//         const message = await Message.findOne({ conversation: req.params.conversationId }).sort({ createdAt: -1 });
//         res.status(200).json(message);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages in a conversation with pagination
// router.get('/:conversationId/paginated', authMiddleware, async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get the total number of messages in a conversation
// router.get('/:conversationId/count', authMiddleware, async (req, res) => {
//     try {
//         const count = await Message.countDocuments({ conversation: req.params.conversationId });
//         res.status(200).json({ count });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });  

// // Get messages in a conversation sorted by creation date
// router.get('/:conversationId/sorted', authMiddleware, async (req, res) => {
//     try {
//         const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: -1 });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages in a conversation that contain a specific keyword
// router.get('/:conversationId/search', authMiddleware, async (req, res) => {
//     try {        const keyword = req.query.keyword;
//         const messages = await Message.find({ conversation: req.params.conversationId, content: { $regex: keyword, $options: 'i' } });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages in a conversation that were sent within a specific date range
// router.get('/:conversationId/date-range', authMiddleware, async (req, res) => {
//     try {        const { startDate, endDate } = req.query;
//         const messages = await Message.find({ conversation: req.params.conversationId, createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages in a conversation that were sent by the authenticated user
// router.get('/:conversationId/my-messages', authMiddleware, async (req, res) => {
//     try {        const messages = await Message.find({ conversation: req.params.conversationId, sender: req.user.userId });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get messages in a conversation that were sent by other users
// router.get('/:conversationId/other-messages', authMiddleware, async (req, res) => {
//     try {        const messages = await Message.find({ conversation: req.params.conversationId, sender: { $ne: req.user.userId } });
//         res.status(200).json(messages);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }); 




// module.exports = router;


const express = require('express');
const router = express.Router();
const Message = require('../model/Message');
const Conversation = require('../model/Conversation');
const authMiddleware = require('../MiddleWares/authMiddleWare');

// Helper: check if user is member of conversation
async function isMember(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;
    const isMember = conversation.members.some(member => member.toString() === userId);
    return isMember ? conversation : null;
}

// Get all messages in a conversation
router.get('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const messages = await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send a message
router.post('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const { content, type } = req.body;
        const message = new Message({
            sender: req.user.userId,
            content,
            type: type || 'text',
            conversation: req.params.conversationId
        });
        await message.save();

        // Update lastMessage in Conversation
        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark message as read
router.post('/:messageId/read', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (!message.readBy.includes(req.user.userId)) {
            message.readBy.push(req.user.userId);
            await message.save();
        }

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a message (only sender can delete)
router.delete('/:messageId', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (message.sender.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }

        await message.remove();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Pagination
router.get('/:conversationId/paginated', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

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

// Last message
router.get('/:conversationId/last', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const message = await Message.findOne({ conversation: req.params.conversationId })
            .sort({ createdAt: -1 });

        res.status(200).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Count messages
router.get('/:conversationId/count', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const count = await Message.countDocuments({ conversation: req.params.conversationId });
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Search messages by keyword
router.get('/:conversationId/search', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const keyword = req.query.keyword || '';
        const messages = await Message.find({
            conversation: req.params.conversationId,
            content: { $regex: keyword, $options: 'i' }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Date range filter
router.get('/:conversationId/date-range', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const { startDate, endDate } = req.query;
        const messages = await Message.find({
            conversation: req.params.conversationId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// My messages
router.get('/:conversationId/my-messages', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const messages = await Message.find({ conversation: req.params.conversationId, sender: req.user.userId });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Other messages
router.get('/:conversationId/other-messages', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        const messages = await Message.find({ conversation: req.params.conversationId, sender: { $ne: req.user.userId } });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;