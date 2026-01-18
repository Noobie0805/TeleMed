import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { applySafetyRules } from "../utils/safetyRules.js";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === "") {
//     console.warn("Warning: GROQ_API_KEY is not set in environment variables.");
// }

const symptomCheckerHandler = AsyncHandler(async (req, res) => {
    const { age, gender, symptoms, duration, existingConditions } = req.body;

    if (age === undefined || gender === undefined || symptoms === undefined) {
        throw new ApiError(400, "Age, gender, and symptoms are required fields.");
    }

    if (typeof age !== "number" || age < 0 || age > 120) {
        throw new ApiError(400, "Age must be between 0 and 120.");
    }

    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
        throw new ApiError(400, "Gender must be 'male', 'female', or 'other'.");
    }

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
        throw new ApiError(400, "Symptoms must be a non-empty array.");
    }

    for (const s of symptoms) {
        if (!s?.name || typeof s.name !== "string") {
            throw new ApiError(400, "Each symptom must have a valid name.");
        }
        if (s.severity === undefined || typeof s.severity !== "number" || s.severity < 1 || s.severity > 10) {
            throw new ApiError(400, "Severity is required and must be between 1-10.");
        }
    }

    const prompt = `
You are a medical symptom information assistant.

STRICT RULES:
- Do NOT diagnose or prescribe.
- Provide only general, non-diagnostic information.
- Classify urgency as: mild | moderate | severe.
- Suggest ONLY 1-3 medical specialities.
- If symptoms may indicate emergency → urgency = "severe".
- Output VALID JSON ONLY. No markdown. No explanations.

Patient Info:
Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms.map(s => `${s.name} (${s.severity}/10, duration: ${s.duration || "not provided"})`).join(", ")}
Overall Duration: ${duration || "not provided"}
Existing Conditions: ${existingConditions || "not provided"}

JSON FORMAT:
{
  "urgency": "",
  "suggestedSpecialities": [],
  "possible_causes": []
}
`;

    const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3-32b"];
    let completion;
    for (const model of models) {
        try {
            completion = await groq.chat.completions.create({
                model: model,
                temperature: 0.1,
                max_tokens: 300,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a medical assistant that outputs STRICT JSON only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });
            if (completion) {
                console.log(`Model ${model} succeeded.`);
                break;
            };
        } catch (err) {
            console.error("Groq API error:", err.message);
            throw new ApiError(503, "AI service temporarily unavailable.");
        }
    }
    if (!completion) {
        throw new ApiError(503, "No models worked, AI service temporarily unavailable.");
    }


    const rawText = completion?.choices?.[0]?.message?.content || "";

    let analysis;
    try {
        analysis = JSON.parse(rawText);
    } catch (err) {
        console.error("Invalid JSON from AI:", rawText);
        throw new ApiError(502, "AI response format was invalid.");
    }

    const safeAnalysis = applySafetyRules(analysis);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                urgency: safeAnalysis.urgency,
                suggestedSpecialities: safeAnalysis.suggestedSpecialities || [],
                possible_causes: safeAnalysis.possible_causes || [],
                emergency: safeAnalysis.emergency || false,
                disclaimer:
                    "This AI provides general health information only and is not a medical diagnosis."
            },
            "Symptom analysis generated successfully."
        )
    );
});

export { symptomCheckerHandler };
