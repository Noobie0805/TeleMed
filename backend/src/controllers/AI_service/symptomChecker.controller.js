import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import axios from "axios";
import symptomSession from "../../models/symptomSession.model.js";

const submitSymptoms = AsyncHandler(async (req, res) => {
    const { age, gender, symptoms, duration, existingConditions, appointmentId } = req.body;

    if (!symptoms?.length || symptoms.length > 10) {
        throw new ApiError(400, "About 1 to 10 symptoms are required.");
    }
    if (age < 0 || age > 120) {
        throw new ApiError(400, "Valid age required");
    }

    // sending data to AI service
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/symptomChecker`,
        { age, gender, symptoms, duration, existingConditions },
        {
            headers: { Authorization: `Bearer ${process.env.AI_INTERNAL_KEY}` },
            timeout: 15000
        }
    );

    if (aiResponse.data.urgency === 'severe') {
        aiResponse.data.emergencyOverride = true;
        aiResponse.data.message = "SEVERE symptoms detected. Seek immediate medical attention.";
    }

    const session = await symptomSession.create({
        patientId: req.user._id,
        symptoms: symptoms.map(s => ({ name: s.name, severity: s.severity })),
        urgency: aiResponse.data.urgency,
        suggestedSpecialities: aiResponse.data.specialties,
        appointmentId,
    });

    return res.status(200).json(new ApiResponse(201, {
        sessionId: session._id,
        analysis: aiResponse.data,
        disclaimer: "AI insights only. Consult a doctor."
    }, "Symptoms analyzed successfully."));

});

export { submitSymptoms };
