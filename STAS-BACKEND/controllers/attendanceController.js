const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Student
const markAttendance = async (req, res) => {
    const { date, breakfast, lunch, dinner } = req.body;
    const userId = req.user._id;

    try {
        /* 
        // --- Time Window Validation ---
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Convert to minutes for easier comparison
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        // Window 1: 09:30 AM - 10:30 AM (Morning) -> 570 mins to 630 mins
        const morningStart = 9 * 60 + 30;
        const morningEnd = 10 * 60 + 30;

        // Window 2: 08:00 PM - 12:00 PM (Night) -> 1200 mins to 1439 mins
        const nightStart = 20 * 60;
        const nightEnd = 24 * 60; // Midnight

        const isMorningWindow = currentTotalMinutes >= morningStart && currentTotalMinutes <= morningEnd;
        const isNightWindow = currentTotalMinutes >= nightStart && currentTotalMinutes <= nightEnd;

        // NOTE: For testing purposes, you might want to comment this out if you are not in these windows
        if (!isMorningWindow && !isNightWindow) {
             return res.status(400).json({ 
                 message: 'Attendance allowed only at 09:30 AM - 10:30 AM and 08:00 PM - 12:00 PM' 
             });
        }
        // ------------------------------
        */

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Validation: Must be at least one day in advance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = attendanceDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
             return res.status(400).json({ message: 'Attendance must be marked at least one day in advance.' });
        }

        const start = new Date(attendanceDate);
        const end = new Date(attendanceDate);
        end.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({ 
            user: userId, 
            date: { $gte: start, $lte: end } 
        });

        if (attendance) {
            // Update
            attendance.breakfast = breakfast !== undefined ? breakfast : attendance.breakfast;
            attendance.lunch = lunch !== undefined ? lunch : attendance.lunch;
            attendance.dinner = dinner !== undefined ? dinner : attendance.dinner;
            await attendance.save();
            res.json(attendance);
        } else {
            // Create
            attendance = await Attendance.create({
                user: userId,
                date: attendanceDate,
                breakfast: breakfast || false,
                lunch: lunch || false,
                dinner: dinner || false
            });
            res.status(201).json(attendance);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for user
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user._id }).sort({ date: 1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily stats (counts and names)
// @route   GET /api/attendance/stats
// @access  Private/Admin/Cook
const getAttendanceStats = async (req, res) => {
    const { date } = req.query;

    try {
        let query = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        // Find all attendance records for the date and populate user details
        const attendanceRecords = await Attendance.find(query).populate('user', 'name email contactNumber profileImage');

        // Structure the data for the table
        const stats = {
            date: date,
            breakfast: [],
            lunch: [],
            dinner: []
        };

        attendanceRecords.forEach(record => {
            if (record.user) { // Ensure user exists
                const studentInfo = {
                    name: record.user.name,
                    email: record.user.email,
                    contact: record.user.contactNumber,
                    profileImage: record.user.profileImage
                };

                if (record.breakfast) stats.breakfast.push(studentInfo);
                if (record.lunch) stats.lunch.push(studentInfo);
                if (record.dinner) stats.dinner.push(studentInfo);
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getMyAttendance, getAttendanceStats };
