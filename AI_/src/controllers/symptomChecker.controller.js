import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { applySafetyRules } from "../../utils/safetyRules.js";
import axios from "axios";


const symptomCheckerHandler = AsyncHandler(async (req, res) => {
    const { age, gender, symptoms, duration, existingConditions } = req.body;

    // Basic request validation to keep the handler resilient
    if (age === undefined || gender === undefined || symptoms === undefined) {
        throw new ApiError(400, "Age, gender, and symptoms are required fields.");
    }
    if (typeof age !== "number" || Number.isNaN(age) || age < 0 || age > 120) {
        throw new ApiError(400, "Age must be a number between 0 and 120.");
    }
    if (typeof gender !== "string" || !["male", "female", "other"].includes(gender.toLowerCase())) {
        throw new ApiError(400, " Gender must be 'male', 'female', or 'other'.");
    }
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
        throw new ApiError(400, "Symptoms must be a non-empty array.");
    }
    for (const symptom of symptoms) {
        if (!symptom || typeof symptom.name !== "string" || symptom.name.trim() === "") {
            throw new ApiError(400, "Each symptom must have a non-empty 'name'.");
        }
        if (symptom.severity !== undefined && (typeof symptom.severity !== "number" || symptom.severity < 0 || symptom.severity > 10)) {
            throw new ApiError(400, "Symptom 'severity' must be a number between 0 and 10 if provided.");
        }
    }

    const prompt = `
    You are a medical symptom information assistant.

    Rules:
    - You must NOT diagnose, prescribe medication, or provide treatment plans.
    - You may only provide general health information and non-diagnostic possible causes.
    - Classify urgency strictly as one of: mild, moderate, severe.
    - Suggest ONLY 1-3 relevant medical specialities.
    - Base reasoning strictly on the provided symptoms.
    - If symptoms indicate a possible emergency, mark urgency as "severe".
    - Output MUST be valid JSON only. No extra text.

    Patient Info:
    Age: ${age}
    Gender: ${gender}
    Symptoms: ${symptoms.map(s => `${s.name} (${s.severity ?? "unknown"}/10)`).join(', ')}
    Duration: ${duration || 'not provided'}
    Existing Conditions: ${existingConditions || 'not provided'}

    Respond strictly in this JSON format:
    {
      "urgency": "",
      "specialities": [],
      "possible_causes": []
    } `;

    const models = [
        'meta-llama/Meta-Llama-3-8B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'google/gemma-2b-it'
    ];

    let aiResponse;
    for (const model of models) {
        try {
            aiResponse = await axios.post(
                'https://api-inference.huggingface.co/models/' + model,
                {
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150,
                        temperature: 0.1
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`
                    },
                    timeout: 10_000
                }
            );

            console.log(`AI response generated using model: ${model}`);

            break; // Exit loop on successful response
        }
        catch (error) {
            console.log(`Model ${model} failed, trying next. Error: ${error.message}`);
        }
    }

    if (!aiResponse) {
        console.log("All models failed to respond.");
        throw new ApiError(500, "AI service is currently unavailable. Please try again later.");
    }

    const rawText = aiResponse?.data?.[0]?.generated_text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new ApiError(502, "AI response did not contain valid JSON.");
    }

    let analysis;
    try {
        analysis = JSON.parse((jsonMatch[0] || "{}").trim());
    }
    catch (parseError) {
        console.log("Failed to parse AI response", parseError.message, { rawText: rawText?.slice(0, 200) });
        throw new ApiError(502, "AI response was invalid. Please try again.");
    }

    const safeAnalysis = applySafetyRules(analysis || {});

    return res.status(200).json(
        ApiResponse(200, {
            urgency: safeAnalysis.urgency,
            specialities: safeAnalysis.specialities || [],
            possible_causes: safeAnalysis.possible_causes || [],
            emergency: safeAnalysis.emergency || false,
            disclaimer:
                "This AI provides general health information only and is not a medical diagnosis."
        }, "Symptom analysis generated successfully.")
    );

});

export { symptomCheckerHandler };