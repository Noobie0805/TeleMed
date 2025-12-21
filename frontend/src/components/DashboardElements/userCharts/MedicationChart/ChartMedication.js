import React from "react";
import {
    Chart as ChartJs,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./ChartMedication.css";

ChartJs.register(ArcElement, Tooltip, Legend, Title);

const ChartMedications = ({ medications }) => {
    let takenCount = 0;
    let missedCount = 0;

    medications.forEach((m) => {
        if (m.status === "Taken") takenCount += 1;
        else if (m.status === "Missed" || m.status === "Skipped") missedCount += 1;
    });

    const data = {
        labels: ["Taken", "Missed"],
        datasets: [
            {
                label: "Doses",
                data: [takenCount, missedCount],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.8)",  // Taken
                    "rgba(255, 99, 132, 0.8)",  // Missed
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "Medications (last 7 days)",
                color: "#ffffff",
                font: {
                    size: 16,
                    weight: "bold",
                },
                padding: {
                    top: 4,
                    bottom: 8,
                },
            },
            legend: {
                position: "bottom",
                labels: {
                    color: "#ffffff",
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const label = ctx.label || "";
                        const value = ctx.raw || 0;
                        const total = takenCount + missedCount || 1;
                        const pct = ((value / total) * 100).toFixed(0);
                        return `${label}: ${value} (${pct}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="medsChartStyle">
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default ChartMedications;
