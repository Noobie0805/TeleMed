
import React from 'react'
import './UserStats.css'
import ChartConsults from './ConsultsChart/ChartConsults.js'
import ChartMedication from './MedicationChart/ChartMedication'
import ChartSteps from './StepsChart/ChartSteps'
import ChartBmi from './BmiChart/ChartBmi'
import WeeklyScoreCard from './WeeklyScoreCard/WeeklyScoreCard.js'
import WeeklyInsightsCard from './WeeklyInsightsCard/WeeklyInsightsCard.js'

const UserStats = () => {
    const bmiEntries = [
        { date: '2022-01-01', weightKg: 62, heightCm: 180 },
        { date: '2023-02-01', weightKg: 65, heightCm: 181 },
        { date: '2024-03-01', weightKg: 78, heightCm: 184 },
        { date: '2025-18-12', weightKg: 88, heightCm: 186 },
        { date: '2025-21-12', weightKg: 89, heightCm: 186 },
    ];
    const appointmentsEntries = [
        // 18 Dec
        { date: "2025-12-18", status: "Completed" },
        { date: "2025-12-18", status: "Completed" },
        { date: "2025-12-18", status: "Missed" },
        // 19 Dec
        { date: "2025-12-19", status: "Completed" },
        { date: "2025-12-19", status: "Completed" },
        { date: "2025-12-19", status: "Cancelled" },
        // 20 Dec
        { date: "2025-12-20", status: "Upcoming" },
        { date: "2025-12-20", status: "Upcoming" },
        { date: "2025-12-20", status: "Completed" },
        // 21 Dec
        { date: "2025-12-21", status: "Upcoming" },
        { date: "2025-12-21", status: "Completed" },
        // 22 Dec
        { date: "2025-12-22", status: "Upcoming" },
        { date: "2025-12-22", status: "Missed" },
        // 23 Dec
        { date: "2025-12-23", status: "Completed" },
        { date: "2025-12-23", status: "Upcoming" },
        { date: "2025-12-23", status: "Cancelled" },
    ]
    const medicationEntries = [
        { date: "2025-12-18", status: "Taken" },
        { date: "2025-12-18", status: "Missed" },
        { date: "2025-12-19", status: "Taken" },
        { date: "2025-12-19", status: "Taken" },
        { date: "2025-12-20", status: "Taken" },
        { date: "2025-12-20", status: "Missed" },
        { date: "2025-12-21", status: "Taken" },
    ];
    const stepsEntries = [
        { date: "2025-12-16", steps: 4200 },
        { date: "2025-12-17", steps: 6800 },
        { date: "2025-12-18", steps: 9500 },
        { date: "2025-12-19", steps: 7200 },
        { date: "2025-12-20", steps: 10500 },
        { date: "2025-12-21", steps: 8300 },
    ];
    // to check for last 7 days
    function isWithinLast7Days(dateStr, today = new Date()) {
        const entryDate = new Date(dateStr);
        const diffMs = today - entryDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays < 7;
    }
    const scoresTotal = ({ bmiEntries, appointmentsEntries, medicationEntries, stepsEntries, heightCm, today = new Date(), }) => {
        // filter to last 7 days
        const bmi7 = bmiEntries.filter(e => isWithinLast7Days(e.date, today));
        const appts7 = appointmentsEntries.filter(e => isWithinLast7Days(e.date, today));
        const meds7 = medicationEntries.filter(e => isWithinLast7Days(e.date, today));
        const steps7 = stepsEntries.filter(e => isWithinLast7Days(e.date, today));

        let bmiPoints = 0;      // max 20
        let consultPoints = 0;  // max 40
        let medPoints = 0;      // max 25
        let stepsPoints = 0;    // max 15

        const bmiMessages = [], consultMessages = [], medMessages = [], stepsMessages = [];
        bmi7.forEach((e) => {
            const hCm = e.heightCm ?? heightCm;
            if (!hCm) return;
            const heightM = hCm / 100;
            const bmi = +(e.weightKg / (heightM * heightM)).toFixed(2);
            if (bmi >= 18.5 && bmi <= 24.9) {
                bmiPoints += 10;
                bmiMessages.push(
                    `On ${e.date}, your BMI of ${bmi} is within the healthy range. Great job!`
                );
            } else if (bmi < 18.5) {
                bmiMessages.push(
                    `On ${e.date}, your BMI of ${bmi} indicates you are underweight. Consider a nutritious diet to gain weight.`
                );
            } else {
                bmiMessages.push(
                    `On ${e.date}, your BMI of ${bmi} indicates overweight. Regular exercise and a balanced diet can help.`
                );
            }
        });
        bmiPoints = Math.min(bmiPoints, 20);
        appts7.forEach((a) => {
            if (a.status === "Completed") {
                consultPoints += 20;
                consultMessages.push(
                    `On ${a.date}, you completed your appointment. Keep up the good work!`
                );
            } else if (a.status === "Missed" || a.status === "Cancelled") {
                consultMessages.push(
                    `On ${a.date}, you missed or cancelled your appointment. Try to attend future appointments for better health management.`
                );
            }
        });
        consultPoints = Math.min(consultPoints, 40);
        meds7.forEach((m) => {
            if (m.status === "Taken") {
                medPoints += 5;
                medMessages.push(
                    `On ${m.date}, you took your medication as prescribed. Excellent adherence!`
                );
            } else if (m.status === "Missed" || m.status === "Skipped") {
                medMessages.push(
                    `On ${m.date}, you missed or skipped your medication. Consistent medication is crucial for effective treatment.`
                );
            }
        });
        medPoints = Math.min(medPoints, 25);
        steps7.forEach((s) => {
            if (s.steps >= 8000) {
                stepsPoints += 3;
                stepsMessages.push(
                    `On ${s.date}, you achieved your step goal with ${s.steps} steps. Fantastic activity level!`
                );
            } else {
                stepsMessages.push(
                    `On ${s.date}, you took ${s.steps} steps. Aim for at least 8000 steps daily for better health.`
                );
            }
        });
        stepsPoints = Math.min(stepsPoints, 15);
        const score = bmiPoints + consultPoints + medPoints + stepsPoints;
        const scorepercent = ((score / 100) * 100).toFixed(0);

        return { score, scorepercent, bmiPoints, consultPoints, medPoints, stepsPoints, bmiMessages, consultMessages, medMessages, stepsMessages, };
    };
    const { score, scorepercent, bmiPoints, consultPoints, medPoints, stepsPoints, bmiMessages, consultMessages, medMessages, stepsMessages } = scoresTotal({ bmiEntries, appointmentsEntries, medicationEntries, stepsEntries, heightCm: 186, today: new Date(), });


    return (
        <div>
            <div className='hello_user_box'>
                <div className='hello_user'>
                    <h2>Hello, User!👋🏻</h2>
                    <p>Welcome to your dashboard. Here you can see your stats, appointments, medications, and activities.</p>
                </div>
            </div>
            <div className='charts_container'>
                <div className='charts_1stRow'>
                    <ChartBmi entries={bmiEntries} heightCm={186} />
                    <ChartMedication medications={medicationEntries} />
                </div>
                <div className='charts_2ndRow'>
                    <ChartConsults appointments={appointmentsEntries} />
                    <ChartSteps steps={stepsEntries} />
                </div>
            </div>
            <div className='WeeklyReport_box'>
                <div className='WeeklyReport_box_scores'> <WeeklyScoreCard score={score} scorepercent={scorepercent} bmiPoints={bmiPoints} consultPoints={consultPoints} medPoints={medPoints} stepsPoints={stepsPoints} /></div>
                <div className='WeeklyReport_box_insights'><WeeklyInsightsCard bmiMessages={bmiMessages} consultMessages={consultMessages} medMessages={medMessages} stepsMessages={stepsMessages} /></div>
            </div>
        </div>
    )
}

export default UserStats;