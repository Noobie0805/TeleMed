import { AsyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ""
});

const chatHandler = AsyncHandler(async (req, res) => {
    const { message, intent } = req.body;

    if (!message || typeof message !== "string") {
        return res.status(400).json({
            response: "Invalid message input."
        });
    }

    const systemPrompt =
        intent === "medicalBot"
            ? `
You are a medical information chatbot.

RULES:
- Do NOT diagnose or prescribe medication.
- Provide only general health information.
- If symptoms seem serious or unclear, suggest using the symptom checker or consulting a doctor.
- Keep responses short, calm, and reassuring.
`
            : `
You are a telehealth platform assistant.

RULES:
- Help users with appointments, scheduling, and platform features.
- Do NOT provide medical advice.
- Keep answers concise and helpful.
- Provide answers in a friendly tone.
- Keep the responses format proper and professional.
`;

    const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"];

    let completion;
    let lastError;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            completion = await groq.chat.completions.create({
                model: model,
                temperature: intent === "medicalBot" ? 0.3 : 0.7,
                max_tokens: 150,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt.trim()
                    },
                    {
                        role: "user",
                        content: String(message).slice(0, 500) // injection guard
                    }
                ]
            });
            if (completion) {
                console.log(`Model ${model} succeeded.`);
                break;
            }
        } catch (err) {
            lastError = err;
            console.error(`Model ${model} error:`, err.message);
        }
    }

    if (!completion) {
        throw new ApiError(503, "AI service temporarily unavailable. Please try again later.");
    }

    const responseText = completion?.choices?.[0]?.message?.content?.trim() ||
        (intent === "medicalBot"
            ? "I can provide general health information, but for symptoms I recommend using the symptom checker or consulting a doctor."
            : "I can help with appointments and platform features. Please try again.");

    return res.status(200).json(
        new ApiResponse(200, {
            response: responseText,
            suggestedAction: intent === "medicalBot" ? "symptom_check" : "book_appointment"
        }, "Chat response generated successfully")
    );
});

export { chatHandler };
