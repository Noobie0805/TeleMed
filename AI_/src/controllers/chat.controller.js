import { AsyncHandler } from "../../utils/AsyncHandler.js";
import axios from "axios";

const chatHandler = AsyncHandler(async (req, res) => {
    const { message, intent } = req.body;

    if (!message || typeof message !== "string") {
        return res.status(400).json({
            response: "Invalid message input."
        });
    }

    // Safety-first system prompt
    const systemPrompt =
        intent === "medicalBot" ?
            `You are a medical information chatbot.
    - Do NOT diagnose or prescribe medication.
    - Provide only general health information.
    - If symptoms seem serious or unclear, suggest using the symptom checker or consulting a doctor.
    - Keep responses short, calm, and reassuring.`
            :
            `You are a telehealth platform assistant.
    - Help users with appointments, platform features, and general usage.
    - Do NOT provide medical advice.`;

    // Prompt with injection protection
    const prompt = `${systemPrompt}
    User message:"${String(message).slice(0, 500)}"
    Assistant:`;

    // Primary + fallback models
    const models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "google/gemma-2b-it"
    ];

    let responseText = null;

    for (const model of models) {
        try {
            const aiResp = await axios.post(
                "https://api-inference.huggingface.co/models/" + model,
                {
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 120,
                        temperature: intent === "medicalBot" ? 0.3 : 0.7
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`
                    },
                    timeout: 8000
                }
            );

            const rawText = aiResp.data?.[0]?.generated_text || "";
            responseText = rawText.replace(prompt, "").trim();

            console.log(`Chat response generated using model: ${model}`);
            break;
        } catch (error) {
            console.log(`Model ${model} failed, trying fallback. Error: ${error.message}`);
        }
    }

    return res.status(200).json({
        response:
            responseText ||
            (intent === "medicalBot"
                ? "I can provide general health information, but for symptoms I recommend using the symptom checker or consulting a doctor."
                : "I can help with appointments and platform features. Please try again."),
        action: intent === "medicalBot" ? "symptom_check" : "book_appointment"
    });
});

export { chatHandler };
