import express from 'express';
import conversation from '../modules/conversation.js';

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {

        const conversations= await conversation.find({
            participants: req.params.userId
        }).populate("participants").populate("lastmessage").sort({ updatedAt: -1 })
        res.json(conversations);
        
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal server error" });
        
    }
})


export default router; 