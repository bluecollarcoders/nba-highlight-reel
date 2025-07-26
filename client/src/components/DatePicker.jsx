import React, { useState } from 'react';

const DatePicker = ({ onDateChange }) => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const handleStartDateChange = (date) => {
        if (!date || isNaN(new Date(date))) return;
        if (new Date(date) > new Date(endDate)) {
            alert("Start date cannot be after end date.");
        } else {
            setStartDate(date);
            onDateChange(date, endDate);
        }
    };

    const handleEndDateChange = (date) => {
        if (!date || isNaN(new Date(date))) return;
        if (new Date(date) < new Date(startDate)) {
            alert("End date cannot be before start date.");
        } else {
            setEndDate(date);
            onDateChange(startDate, date);
        }
    };

    const handlePreset = (range) => {
        let start;
        if (range === 'last7days') {
            start = new Date();
            start.setDate(start.getDate() - 7);
        } else if (range === 'thisMonth') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (range === 'thisSeason') {
            start = new Date(2024, 9, 1);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        onDateChange(start.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    };

    return (
        <div className="date-picker">
            <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
            />
            <div className="flex-container">
                <button onClick={() => handlePreset('last7days')}>Last 7 Days</button>
                <button onClick={() => handlePreset('thisMonth')}>This Month</button>
                <button onClick={() => handlePreset('thisSeason')}>This Season</button>
            </div>
        </div>
    );
};

export default DatePicker;
