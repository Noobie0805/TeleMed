import React from "react";
import {
    Chart as ChartJs,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./ChartSteps.css";

ChartJs.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    Filler
);

const DAILY_GOAL = 8000; // steps

const ChartSteps = ({ steps }) => {
    const labels = steps.map((e) => e.date);
    const stepValues = steps.map((e) => e.steps);
    const goalValues = steps.map(() => DAILY_GOAL);

    const data = {
        labels,
        datasets: [
            {
                label: "Steps",
                data: stepValues,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.3)",
                fill: true,
                tension: 0.3,
                pointRadius: 2,
            },
            {
                label: "Goal",
                data: goalValues,
                borderColor: "rgba(255, 206, 86, 1)",
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "Steps (last 7 days)",
                color: "#ffffff",
                font: {
                    size: 16,
                    weight: "bold",
                },
                padding: { top: 4, bottom: 8 },
            },
            legend: {
                position: "bottom",
                labels: {
                    color: "#ffffff",
                    font: { size: 12 },
                },
            },
            tooltip: { intersect: false, mode: "index" },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#ffffff" },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#ffffff" },
            },
        },
    };

    return (
        <div className="stepsChartStyle">
            <Line data={data} options={options} />
        </div>
    );
};

export default ChartSteps;
