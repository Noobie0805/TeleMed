import React from "react";
import "./WeeklyInsightsCard.css";

const WeeklyInsightsCard = ({ bmiMessages, consultMessages, medMessages, stepsMessages }) => {

    const insights = [bmiMessages[0], consultMessages[0], medMessages[0], stepsMessages[0],].filter(Boolean); // remove undefined

    return (
        <div className="weeklyInsightsCard">
            <h3 className="weeklyInsightsCard-title">Insights from this week</h3>
            {insights.length === 0 ? (
                <p className="weeklyInsightsCard-empty">
                    Not enough data yet. Keep logging your activity this week.
                </p>
            ) : (
                <ul className="weeklyInsightsCard-list">
                    {insights.map((msg, i) => (
                        <li key={i} className="weeklyInsightsCard-item">
                            {msg}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WeeklyInsightsCard;
