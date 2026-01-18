import { ApiError } from "../../utils/apiError.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Appointment from "../../models/appointments.model.js";


const submitConsultNotes = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { notes, prescription, diagnosis, followUpInstructions } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Unauthorized to submit consultation for this appointment');
    }
    if (appointment.status !== 'completed') {
        throw new ApiError(400, 'Cannot submit consultation for incomplete appointment');
    }
    if (appointment.postConsult?.submittedAt) {
        throw new ApiError(400, 'Consultation already submitted');
    }

    appointment.postConsult = appointment.postConsult || {};
    appointment.postConsult.notes = notes;
    appointment.postConsult.prescription = prescription;
    appointment.postConsult.diagnosis = diagnosis;
    appointment.postConsult.followUpInstructions = followUpInstructions;
    appointment.postConsult.submittedAt = new Date();
    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, 'Consultation submitted successfully'));

});
const submitPatientRatings = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    let { rating, feedback } = req.body; // rating: 1-5

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to rate this appointment");
    }

    if (appointment.status !== "completed") {
        throw new ApiError(400, "Can only rate completed appointments");
    }

    if (appointment.patientRating) {
        throw new ApiError(400, "Rating already submitted");
    }

    // Normalize and validate rating
    rating = Number(rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5");
    }

    appointment.patientRating = rating;
    appointment.patientFeedback = feedback ?? "";
    await appointment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { rating: appointment.patientRating, feedback: appointment.patientFeedback }, "Rating submitted"));
});

export { submitConsultNotes, submitPatientRatings };