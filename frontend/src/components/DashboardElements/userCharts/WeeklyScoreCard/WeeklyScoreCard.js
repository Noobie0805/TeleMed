import React from "react";
import "./WeeklyScoreCard.css";

const WeeklyScoreCard = ({ score, scorepercent, bmiPoints, consultPoints, medPoints, stepsPoints }) => {
    const percent = Number(scorepercent ?? score) || 0;

    let status = "Needs attention";
    let statusColor = "#f87171"; // red
    if (percent >= 80) {
        status = "Excellent";
        statusColor = "#4ade80"; // green
    } else if (percent >= 50) {
        status = "Good";
        statusColor = "#facc15"; // yellow
    }

    return (
        <div className="weeklyScoreCard">
            <div className="weeklyScoreCard-main">
                <h3 className="weeklyScoreCard-title">Weekly health score</h3>
                <div className="weeklyScoreCard-scoreRow">
                    <span className="weeklyScoreCard-score">{percent}</span>
                    <span className="weeklyScoreCard-scoreMax">/ 100</span>
                </div>
                <div className="weeklyScoreCard-progressBar">
                    <div className="weeklyScoreCard-progressFill" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
                </div>
                <span className="weeklyScoreCard-statusChip" style={{ backgroundColor: statusColor }} >
                    {status}
                </span>
            </div>

            <div className="weeklyScoreCard-breakdown">
                {/* <h3>Category breakdown</h3> */}
                <BreakdownRow label="BMI" points={bmiPoints} max={20} color="#4fd1c5" />
                <BreakdownRow label="Appointments" points={consultPoints} max={40} color="#60a5fa" />
                <BreakdownRow label="Medications" points={medPoints} max={25} color="#f97316" />
                <BreakdownRow label="Steps" points={stepsPoints} max={15} color="#22c55e" />
            </div>
        </div>
    );
};

const BreakdownRow = ({ label, points, max, color }) => {
    const pct = max > 0 ? (points / max) * 100 : 0;

    return (
        <div className="weeklyScoreCard-row">
            <div className="weeklyScoreCard-rowTop">
                <span className="weeklyScoreCard-rowLabel">{label}</span>
                <span className="weeklyScoreCard-rowValue">
                    {points} / {max}
                </span>
            </div>
            <div className="weeklyScoreCard-rowBar">
                <div className="weeklyScoreCard-rowBarFill" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color}} />
            </div>
        </div>
    );
};

export default WeeklyScoreCard;
