import express from 'express';
import { askAI } from '../services/aiService.js';

const router = express.Router();

router.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'Question is required.' });
  }
  try {
    const result = await askAI(question, context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'AI service error.' });
  }
});

export default router; 