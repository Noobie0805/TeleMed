import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Appointment from "../../models/appointments.model.js";

const getAppointmentStats = AsyncHandler(async (req, res) => {
    const stats = await Appointment.aggregate([
        // Group by status
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                avgDuration: {
                    $avg: {
                        $cond: [
                            { $ifNull: ["$duration", false] },
                            { $divide: ["$duration", 60] }, // minutes
                            null
                        ]
                    }
                }
            }
        },

        // Collapse into single document
        {
            $group: {
                _id: null,
                statuses: {
                    $push: {
                        status: "$_id",
                        count: "$count",
                        avgDuration: "$avgDuration"
                    }
                },
                totalAppointments: { $sum: "$count" }
            }
        },

        // Calculate no-show rate 
        {
            $project: {
                statuses: 1,
                totalAppointments: 1,
                noShowRate: {
                    $let: {
                        vars: {
                            noShow: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$statuses",
                                            as: "s",
                                            cond: { $eq: ["$$s.status", "no-show"] }
                                        }
                                    },
                                    0
                                ]
                            }
                        },
                        in: {
                            $cond: [
                                { $gt: ["$$noShow.count", 0] },
                                { $divide: ["$$noShow.count", "$totalAppointments"] },
                                0
                            ]
                        }
                    }
                }
            }
        }
    ]);

    // Fallback if no appointments exist
    const summary = stats[0] || {
        statuses: [],
        totalAppointments: 0,
        noShowRate: 0
    };

    // Recent appointments (last 7 days)
    const recentAppointments = await Appointment
        .find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("patientId doctorId status slot.date noShowType")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...summary,
                recentAppointments,
                today: new Date().toISOString().split("T")[0]
            },
            "Appointment stats loaded"
        )
    );
});

export { getAppointmentStats };
