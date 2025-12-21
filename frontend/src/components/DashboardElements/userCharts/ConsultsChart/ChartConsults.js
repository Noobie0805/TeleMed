import React from "react";
import {
    Chart as ChartJs,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from "chart.js";
import { Bar } from "react-chartjs-2";

import "./ChartConsults.css";

ChartJs.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const ChartConsults = ({ appointments }) => {
    const countByDate = {};

    appointments.forEach((apt) => {
        if (!countByDate[apt.date]) {
            countByDate[apt.date] = { completed: 0, missed: 0, upcoming: 0 };
        }

        if (apt.status === "Completed") {
            countByDate[apt.date].completed += 1;
        } else if (apt.status === "Missed" || apt.status === "Cancelled") {
            countByDate[apt.date].missed += 1;
        } else if (apt.status === "Upcoming") {
            countByDate[apt.date].upcoming += 1;
        }
    });

    const labels = Object.keys(countByDate).sort(); // sorted dates
    const completedCounts = labels.map((date) => countByDate[date].completed);
    const missedCounts = labels.map((date) => countByDate[date].missed);
    const upcomingCounts = labels.map((date) => countByDate[date].upcoming);

    const data = {
        labels,
        datasets: [
            {
                label: "Completed",
                data: completedCounts,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
            {
                label: "Missed / Cancelled",
                data: missedCounts,
                backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
            {
                label: "Upcoming",
                data: upcomingCounts,
                backgroundColor: "rgba(255, 206, 86, 0.6)",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "Appointments",
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
                position: "top",
                labels: {
                    color: "#ffffff",
                    font: {
                        size: 12,
                    },
                    boxWidth: 12,
                },
            },
            tooltip: { intersect: false, mode: "index" },
        },
        scales: {
            x: {
                stacked: true,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#ffffff" },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { stepSize: 1, color: "#ffffff" },
                grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
        },
    };


    return (
        <div className="consultChartStyle">
            <Bar data={data} options={options} />
        </div>
    );
};

export default ChartConsults;
