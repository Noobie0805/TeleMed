import React from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function VitalChart({ chartData }) {
  if (!chartData) return null;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <Line data={chartData} />
    </div>
  );
}

