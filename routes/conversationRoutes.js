const express = require('express');
const router = express.Router();
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const authMiddleware = require('../MiddleWares/authMiddleWare');

// Helper: check if user is member of conversation
async function isMember(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;
    const isMember = conversation.members.some(member => member.toString() === userId);
    return isMember ? conversation : null;
}

// Create a new conversation (single or group)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { members, isGroup, groupName } = req.body;
        if (isGroup && (!groupName || groupName.trim() === '')) {
            return res.status(400).json({ message: 'Group name is required for group conversations' });
        }
        if (!members || !Array.isArray(members) || members.length < 1) {
            return res.status(400).json({ message: 'At least one member is required' });
        }
        if (!members.includes(req.user.userId)) members.push(req.user.userId);

        const conversation = new Conversation({
            members,
            isGroup: isGroup || false,
            groupName: isGroup ? groupName : undefined
        });
        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all conversations for authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.find({ members: req.user.userId })
            .populate('members', 'name phone')
            .populate('lastMessage');
        res.status(200).json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a single conversation by ID
router.get('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });

        await conversation.populate('members', 'name phone');
        await conversation.populate('lastMessage');
        res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add members to a group conversation
router.post('/:conversationId/add-members', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });
        if (!conversation.isGroup) return res.status(400).json({ message: 'Cannot add members to a single conversation' });

        const { newMembers } = req.body;
        if (!newMembers || !Array.isArray(newMembers) || newMembers.length === 0) {
            return res.status(400).json({ message: 'No members provided to add' });
        }
        newMembers.forEach(member => {
            if (!conversation.members.includes(member)) conversation.members.push(member);
        });

        await conversation.save();
        await conversation.populate('members', 'name phone');
        res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove a member from group conversation
router.post('/:conversationId/remove-member', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });
        if (!conversation.isGroup) return res.status(400).json({ message: 'Cannot remove members from a single conversation' });

        const { memberId } = req.body;
        conversation.members = conversation.members.filter(member => member.toString() !== memberId);

        await conversation.save();
        await conversation.populate('members', 'name phone');
        res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update group conversation name
router.post('/:conversationId/update-name', authMiddleware, async (req, res) => {
    try {
        const conversation = await isMember(req.params.conversationId, req.user.userId);
        if (!conversation) return res.status(403).json({ message: 'Access denied' });
        if (!conversation.isGroup) return res.status(400).json({ message: 'Cannot rename a single conversation' });

        const { groupName } = req.body;
        if (!groupName || groupName.trim() === '') {
            return res.status(400).json({ message: 'Group name is required' });
        }

        conversation.groupName = groupName;
        await conversation.save();
        res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a conversation
router.delete('/:conversationId', authMiddleware, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        if (!conversation.members.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Message.deleteMany({ conversation: req.params.conversationId });
        await conversation.remove();
        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;