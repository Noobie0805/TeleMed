import React from 'react'
//internal
import "./UserScores.css"

const UserScores = ({ scoresEntries }) => {
    const { score, scorepercent, bmiPoints, consultPoints, medPoints, stepsPoints, bmiMessages, consultMessages, medMessages, stepsMessages } = scoresEntries;
    const statusScore = ({ scorepercent }) => {
        if (scorepercent >= 80) {
            return { message: "Excellent work!", color: "#4BB543" };
        }
        else if (scorepercent >= 50 && scorepercent < 80) {
            return { message: "Good effort, keep going!", color: "#FFA500" };
        }
        else if (scorepercent < 50) {
            return { message: "Needs improvement!", color: "#FF0000" };
        }
    };
    return (        <div className='userScoresbox'>
            <div className='WeeklyScoreCard_box'>
                <div className='WeeklyScoreCard_box_left'>
                </div>
                <div className='WeeklyScoreCard_box_right'>
                </div>
            </div>
            <div className='WeeklyInsights_box'></div>
        </div>
    )
}

export default UserScores