/**
 * Timezone utility functions for IST (Indian Standard Time) handling
 * IST is UTC+5:30
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
/**
 * Get today's IST date bounds in UTC
 * Returns the start and end of today in IST, converted to UTC for database queries
 * @returns {{start: Date, end: Date}} UTC dates representing IST midnight today and tomorrow
 */
export const getISTTodayUTCBounds = () => {
    // Current time in UTC
    const nowUTC = new Date();

    // Get today's IST date parts
    const istNow = new Date(nowUTC.getTime() + IST_OFFSET_MS);

    // IST midnight
    const istStart = new Date(istNow);
    istStart.setHours(0, 0, 0, 0);

    // IST tomorrow midnight
    const istEnd = new Date(istStart);
    istEnd.setDate(istEnd.getDate() + 1);

    // Convert IST → UTC
    const startUTC = new Date(istStart.getTime() - IST_OFFSET_MS);
    const endUTC = new Date(istEnd.getTime() - IST_OFFSET_MS);

    return { start: startUTC, end: endUTC };
};

/**
 * Convert a date string (YYYY-MM-DD) to IST midnight UTC
 * This ensures dates are stored consistently regardless of server timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format (from HTML date input)
 * @returns {Date} UTC date representing IST midnight of the given date
 */
export const convertISTDateToUTC = (dateString) => {
    if (!dateString) {
        throw new Error('Date string is required');
    }
    // Parse the date string (YYYY-MM-DD) - this creates a date at midnight in local timezone
    // We need to interpret it as IST midnight
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date object for IST midnight of the given date
    // We'll create it in UTC first, then adjust for IST
    const istMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    // Since Date.UTC creates UTC time, we need to subtract IST offset to get the UTC equivalent
    // IST midnight = UTC (midnight - 5:30 hours) = previous day 18:30 UTC
    const utcDate = new Date(istMidnight.getTime() - IST_OFFSET_MS);
    return utcDate;
};

/**
 * Get IST date bounds for a specific date string
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {{start: Date, end: Date}} UTC dates representing IST midnight of the given date and next day
 */
export const getISTDateUTCBounds = (dateString) => {
    const startUTC = convertISTDateToUTC(dateString);
    
    // End is start of next day
    const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
    
    return { start: startUTC, end: endUTC };
};

/**
 * Convert IST date (stored as UTC) and IST time string to UTC Date
 * This is used when slot.date is already stored as IST midnight UTC
 * @param {Date} istDateUTC - Date stored as IST midnight UTC (from appointment.slot.date)
 * @param {string} timeString - Time string in HH:mm format (IST time)
 * @returns {Date} UTC date representing the IST date + time
 */
export const getISTDateTimeUTC = (istDateUTC, timeString) => {
    if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) {
        throw new Error('Time string must be in HH:mm format');
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    
    // istDateUTC is IST midnight UTC, so we need to:
    // 1. Add IST offset to get back to IST midnight
    // 2. Add hours and minutes in IST
    // 3. Subtract IST offset to get UTC
    
    const istMidnight = new Date(istDateUTC.getTime() + IST_OFFSET_MS);
    const istDateTime = new Date(istMidnight);
    istDateTime.setHours(hours, minutes, 0, 0);
    
    // Convert back to UTC
    const utcDateTime = new Date(istDateTime.getTime() - IST_OFFSET_MS);
    
    return utcDateTime;
};
