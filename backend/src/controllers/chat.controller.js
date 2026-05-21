import axios from 'axios';

export const chatQuery = async (req, res, next) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query required' });
    }

    // Call AI service for RAG-based chat
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/api/chat`, {
      query,
      userId: req.user._id,
      context,
    });

    res.json({
      success: true,
      response: response.data.response,
      sources: response.data.sources,
    });
  } catch (error) {
    next(error);
  }
};
