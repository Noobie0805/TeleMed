import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import axios from 'axios';

const sendChatMessage = AsyncHandler(async (req, res) => {
    const { message, context = 'platform' } = req.body; // 'medical' or 'platform'

    if (!message || message.trim() === '') {
        throw new ApiError(400, "Message cannot be empty");
    }

    if (context !== 'medical' && context !== 'platform') {
        throw new ApiError(400, "Invalid context value");
    }

    // Phase 3.2: Intent detection
    const intent = context === 'medical' ? 'medicalBot' : 'supportBot';

    // Ensure AI service configuration exists
    if (!process.env.AI_SERVICE_URL || !process.env.AI_INTERNAL_KEY) {
        throw new ApiError(500, 'AI service not configured');
    }

    // Forward to ai-service
    let aiResponse;
    try {
        aiResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/chat`,
            {
                message,
                intent,
                userId: req.user?._id,
                sessionId: req.headers['x-session-id']?.toString()
            },
            {
                headers: { Authorization: `Bearer ${process.env.AI_INTERNAL_KEY}` },
                timeout: 8000
            }
        );
    } catch (err) {
        const status = err?.response?.status && Number.isInteger(err.response.status)
            ? err.response.status
            : 502;
        throw new ApiError(status, 'AI service unavailable');
    }

    return res.json(
        new ApiResponse(200, {
            response: aiResponse.data.response,
            suggestedAction: aiResponse.data.action,  // 'book_appointment', 'symptom_check'
            disclaimer: context === 'medical' ? "Consult a doctor for medical advice." : null
        }, "AI response generated")
    );
});

export { sendChatMessage };
