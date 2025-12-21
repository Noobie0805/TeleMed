import React from "react";
import {
    Chart as ChartJs,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./ChartBmi.css";

ChartJs.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title
);

const ChartBmi = ({ entries, heightCm }) => {
    // const heightM = heightCm / 100;
    const labels = entries.map((e) => e.date);
    const bmiValues = entries.map((e) =>
        +(e.weightKg / ((e.heightCm / 100) * (e.heightCm / 100))).toFixed(2)
    );
    const safeBmiStart = 18.5;
    const safeBmiEnd = 24.9;

    const data = {
        labels,
        datasets: [
            {
                label: "Obese ",
                data: Array(labels.length).fill(safeBmiEnd),
                borderColor: "rgba(153, 102, 255, 0)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                pointRadius: 0,
                fill: "+1",
            },
            {
                label: "Deficient",
                data: Array(labels.length).fill(safeBmiStart),
                borderColor: "rgba(153, 102, 255, 0)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                pointRadius: 0,
                fill: false,
            },
            {
                label: "BMI",
                data: bmiValues,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.3)",
                tension: 0.3,
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
                text: "BMI",
                color: "#ffffff",
                font: { size: 16, weight: "bold" },
                align: "center",
                padding: { top: 4, bottom: 8 },
            },
            legend: {
                position: "top",
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
                suggestedMin: 15,
                suggestedMax: 35,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#ffffff" },
            },
        },
    };

    return (
        <div className="bmiChartStyle">
            <Line data={data} options={options} />
        </div>
    );
};

export default ChartBmi;
