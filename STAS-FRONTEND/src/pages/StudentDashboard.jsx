import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
    // Default to tomorrow
    const getTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const [date, setDate] = useState(getTomorrow());
    
    const [menu, setMenu] = useState(null);
    const [attendance, setAttendance] = useState({ breakfast: false, lunch: false, dinner: false });
    const [generalAttendance, setGeneralAttendance] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [windowStatus, setWindowStatus] = useState({ isOpen: false, msg: 'Checking time...' });
    
    // Movement State
    const [movementStatus, setMovementStatus] = useState('in');
    const [checkoutReason, setCheckoutReason] = useState('');
    const [lastMovement, setLastMovement] = useState(null);

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    const fetchMovementStatus = useCallback(async () => {
        try {
            const { data } = await api.get('/api/movement', config);
            if (data && data.length > 0) {
                const latest = data[0];
                setLastMovement(latest);
                setMovementStatus(latest.status);
            } else {
                setMovementStatus('in');
                setLastMovement(null);
            }
        } catch (error) {
            console.error("Error fetching movement status:", error);
        }
    }, [config]);

    useEffect(() => {
        fetchMovementStatus();
    }, [fetchMovementStatus]);

    // Check Time Window
    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // Window 1: 09:30 - 10:30 (570 - 630)
            const isMorning = totalMinutes >= 570 && totalMinutes <= 630;
            
            // Window 2: 20:00 - 24:00 (1200 - 1440)
            const isNight = totalMinutes >= 1200 && totalMinutes <= 1440;

            if (isMorning || isNight) {
                setWindowStatus({ isOpen: true, msg: 'Window Open' });
            } else {
                setWindowStatus({ isOpen: false, msg: 'Attendance can only be marked at 9:30 AM - 10:30 AM or 8:00 PM - 12:00 PM' });
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const fetchMenuAndAttendance = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Menu
            const menuRes = await api.get(`/api/menu?date=${date}`, config);
            if (menuRes.data && menuRes.data.length > 0) {
                setMenu(menuRes.data[0]);
            } else {
                setMenu(null);
            }

            // Fetch My Attendance (legacy meals)
            const attRes = await api.get('/api/attendance/my', config);
            const myAtt = attRes.data.find(a => a.date.startsWith(date));
            
            if (myAtt) {
                setAttendance({
                    breakfast: myAtt.breakfast,
                    lunch: myAtt.lunch,
                    dinner: myAtt.dinner
                });
            } else {
                setAttendance({ breakfast: false, lunch: false, dinner: false });
            }

            // Fetch typed attendance for general
            const typeRes = await api.get('/api/attendance-types/my', config);
            const myGeneral = typeRes.data.find(a => a.type === 'general' && a.date.startsWith(date));
            setGeneralAttendance(myGeneral || null);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, [date, config]);

    useEffect(() => {
        fetchMenuAndAttendance();
    }, [fetchMenuAndAttendance]);

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/api/attendance', { date, ...attendance }, config);
            setMessage('SUCCESS'); // Trigger for custom popup
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error marking attendance');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!checkoutReason) return setMessage('Reason is required');
        try {
            await api.post('/api/movement/checkout', { reason: checkoutReason }, config);
            setCheckoutReason('');
            setMessage('SUCCESS');
            fetchMovementStatus();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error checking out');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleCheckin = async () => {
        try {
            await api.put('/api/movement/checkin', {}, config);
            setMessage('SUCCESS');
            fetchMovementStatus();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error checking in');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="container mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4"
                >
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Student Dashboard
                    </h1>
                    <button onClick={fetchMenuAndAttendance} className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition">
                        Refresh Data
                    </button>
                </motion.div>

                {/* Status Banner */}
                <motion.div 
                    animate={{ backgroundColor: windowStatus.isOpen ? 'rgba(6, 78, 59, 0.5)' : 'rgba(127, 29, 29, 0.5)' }}
                    className={`p-4 rounded-lg mb-8 border ${windowStatus.isOpen ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300'} flex items-center justify-center font-bold`}
                >
                    {windowStatus.isOpen ? '✅ Attendance Window is OPEN' : `⛔ ${windowStatus.msg}`}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Menu Display */}
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-300">Menu</h2>
                            <input 
                                type="date" 
                                className="bg-gray-900 border border-gray-700 p-2 rounded text-white focus:border-blue-500 focus:outline-none"
                                value={date}
                                min={getTomorrow()}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        {menu ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-yellow-500">
                                    <h3 className="text-yellow-400 font-bold text-lg">Breakfast</h3>
                                    <p className="text-gray-300 mt-1">{menu.breakfast}</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-green-500">
                                    <h3 className="text-green-400 font-bold text-lg">Lunch</h3>
                                    <p className="text-gray-300 mt-1">{menu.lunch}</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-indigo-500">
                                    <h3 className="text-indigo-400 font-bold text-lg">Dinner</h3>
                                    <p className="text-gray-300 mt-1">{menu.dinner}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <span className="text-4xl mb-2">🍽️</span>
                                <p>No menu posted for this date.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Attendance Form */}
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-purple-300">Mark Attendance</h2>
                        
                        <form onSubmit={handleAttendanceSubmit}>
                            <div className="space-y-4 mb-8">
                                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${attendance.breakfast ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 rounded text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600"
                                        checked={attendance.breakfast}
                                        onChange={(e) => setAttendance({...attendance, breakfast: e.target.checked})}
                                        disabled={!windowStatus.isOpen}
                                    />
                                    <span className="ml-4 text-lg font-medium">Breakfast</span>
                                </label>

                                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${attendance.lunch ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 rounded text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600"
                                        checked={attendance.lunch}
                                        onChange={(e) => setAttendance({...attendance, lunch: e.target.checked})}
                                        disabled={!windowStatus.isOpen}
                                    />
                                    <span className="ml-4 text-lg font-medium">Lunch</span>
                                </label>

                                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${attendance.dinner ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-900 border-gray-700 hover:border-gray-600'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 rounded text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600"
                                        checked={attendance.dinner}
                                        onChange={(e) => setAttendance({...attendance, dinner: e.target.checked})}
                                        disabled={!windowStatus.isOpen}
                                    />
                                    <span className="ml-4 text-lg font-medium">Dinner</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!windowStatus.isOpen}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition duration-200 shadow-lg ${windowStatus.isOpen ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                {windowStatus.isOpen ? 'Save Preferences' : 'Window Closed'}
                            </button>
                        </form>
                        <div className="mt-8 p-6 rounded-xl border border-gray-700 bg-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-blue-300">General Attendance (before 11:00 AM)</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold">Status</div>
                                    <div className="text-sm text-gray-400">
                                        {generalAttendance ? (generalAttendance.status === 'verified' ? 'Verified by admin' : (generalAttendance.status === 'dismissed' ? 'Dismissed by admin' : 'Yet to be verified by admin')) : 'Not marked'}
                                    </div>
                                </div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            const { data } = await api.post('/api/attendance-types/general', { date }, config);
                                            setGeneralAttendance(data);
                                            setMessage('SUCCESS');
                                            setTimeout(() => setMessage(''), 3000);
                                        } catch (error) {
                                            setMessage(error.response?.data?.message || 'Error marking attendance');
                                            setTimeout(() => setMessage(''), 5000);
                                        }
                                    }}
                                    className="px-6 py-3 rounded font-bold bg-blue-600 hover:bg-blue-500"
                                >
                                    {generalAttendance ? 'Marked' : 'Mark General'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 p-6 rounded-xl border border-gray-700 bg-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-teal-300">Hostel Movement</h3>
                            {movementStatus === 'out' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-900/30 border border-red-500 rounded text-red-200">
                                        You are currently <strong>OUT</strong>.
                                        <div className="text-sm mt-1">Reason: {lastMovement?.reason}</div>
                                        <div className="text-sm">Since: {lastMovement && new Date(lastMovement.checkoutTime).toLocaleTimeString()}</div>
                                    </div>
                                    <button 
                                        onClick={handleCheckin}
                                        className="w-full py-3 rounded font-bold bg-teal-600 hover:bg-teal-500 text-white transition duration-200"
                                    >
                                        Check In
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 mb-2">Reason for leaving</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-teal-500 focus:outline-none"
                                            value={checkoutReason}
                                            onChange={(e) => setCheckoutReason(e.target.value)}
                                            placeholder="e.g., Going to market"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full py-3 rounded font-bold bg-teal-600 hover:bg-teal-500 text-white transition duration-200"
                                    >
                                        Check Out
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Success Popup */}
            <AnimatePresence>
                {message === 'SUCCESS' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        className="fixed bottom-10 right-10 bg-green-600 text-white p-6 rounded-xl shadow-2xl flex items-center gap-4 z-50"
                    >
                        <span className="text-4xl">✅</span>
                        <div>
                            <h4 className="font-bold text-xl">Saved!</h4>
                            <p>Your attendance has been marked.</p>
                        </div>
                    </motion.div>
                )}
                {message && message !== 'SUCCESS' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-red-600 text-white p-4 rounded-xl shadow-2xl z-50"
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
