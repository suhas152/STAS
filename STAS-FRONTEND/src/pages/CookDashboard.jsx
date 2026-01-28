import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, API_BASE_URL } from '../lib/api';
import { motion } from 'framer-motion';

const CookDashboard = () => {
    const [view, setView] = useState('menu'); // 'menu' | 'attendance'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Menu State
    const [menu, setMenu] = useState({ breakfast: '', lunch: '', dinner: '' });
    const [isMenuLoading, setIsMenuLoading] = useState(false);
    
    // Stats State
    const [stats, setStats] = useState({ breakfast: [], lunch: [], dinner: [] });
    
    // Message State
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // --- Fetchers ---
    const fetchMenu = useCallback(async () => {
        try {
            const { data } = await api.get(`/api/menu?date=${date}`, config);
            if (data && data.length > 0) {
                setMenu({
                    breakfast: data[0].breakfast || '',
                    lunch: data[0].lunch || '',
                    dinner: data[0].dinner || ''
                });
            } else {
                setMenu({ breakfast: '', lunch: '', dinner: '' });
            }
        } catch (error) {
            console.error(error);
        }
    }, [date, config]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get(`/api/attendance/stats?date=${date}`, config);
            // Data structure: { date, breakfast: [users], lunch: [users], dinner: [users] }
            setStats(data || { breakfast: [], lunch: [], dinner: [] });
        } catch (error) {
            console.error(error);
        }
    }, [date, config]);

    // --- Handlers ---
    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsMenuLoading(true);
        try {
            await api.post('/api/menu', { date, ...menu }, config);
            setMessage('Menu updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error updating menu');
        } finally {
            setIsMenuLoading(false);
        }
    };

    const refreshData = () => {
        if (view === 'menu') fetchMenu();
        if (view === 'attendance') fetchStats();
    };

    useEffect(() => {
        if (view === 'menu') fetchMenu();
        if (view === 'attendance') fetchStats();
    }, [view, date, fetchMenu, fetchStats]);

    // --- Render Helpers ---
    const renderStudentList = (students) => {
        if (!students || students.length === 0) return <p className="text-gray-400 italic">No students</p>;
        return (
            <ul className="space-y-3">
                {students.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                            {s.profileImage ? (
                                <img src={`${API_BASE_URL}${s.profileImage}`} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">👤</div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-sm">{s.name}</div>
                            <div className="text-xs text-gray-500">{s.contact}</div>
                        </div>
                    </li>
                ))}
            </ul>
        );
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
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                        Cook Dashboard
                    </h1>
                    <button 
                        onClick={refreshData} 
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition duration-200 text-sm"
                    >
                        Refresh Data
                    </button>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="w-full md:w-1/4">
                        <label className="block text-gray-400 mb-2">Select Date</label>
                        <input 
                            type="date" 
                            className="w-full bg-gray-800 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-blue-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-4">
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'menu' ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('menu')}
                        >
                            Manage Menu
                        </button>
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'attendance' ? 'bg-teal-600 shadow-lg shadow-teal-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('attendance')}
                        >
                            View Attendance
                        </button>
                    </div>
                </div>

                {message && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded"
                    >
                        {message}
                    </motion.div>
                )}

                {view === 'menu' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-blue-300">Set Menu for {date}</h2>
                        <form onSubmit={handleMenuSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-yellow-400 font-bold mb-2">Breakfast</label>
                                    <textarea 
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white h-32 focus:border-yellow-500 focus:outline-none"
                                        value={menu.breakfast}
                                        onChange={(e) => setMenu({...menu, breakfast: e.target.value})}
                                        placeholder="Enter breakfast items..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-green-400 font-bold mb-2">Lunch</label>
                                    <textarea 
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white h-32 focus:border-green-500 focus:outline-none"
                                        value={menu.lunch}
                                        onChange={(e) => setMenu({...menu, lunch: e.target.value})}
                                        placeholder="Enter lunch items..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-indigo-400 font-bold mb-2">Dinner</label>
                                    <textarea 
                                        className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white h-32 focus:border-indigo-500 focus:outline-none"
                                        value={menu.dinner}
                                        onChange={(e) => setMenu({...menu, dinner: e.target.value})}
                                        placeholder="Enter dinner items..."
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isMenuLoading}
                                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition duration-200"
                            >
                                {isMenuLoading ? 'Saving...' : 'Save Menu'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {view === 'attendance' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-teal-300">Attendance Sheet for {date}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 text-left">
                                        <th className="p-4 border border-gray-700 text-yellow-400 w-1/3">
                                            Breakfast <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded ml-2">{stats.breakfast?.length || 0}</span>
                                        </th>
                                        <th className="p-4 border border-gray-700 text-green-400 w-1/3">
                                            Lunch <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded ml-2">{stats.lunch?.length || 0}</span>
                                        </th>
                                        <th className="p-4 border border-gray-700 text-indigo-400 w-1/3">
                                            Dinner <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded ml-2">{stats.dinner?.length || 0}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-top">
                                        <td className="p-4 border border-gray-700 bg-gray-800/50">
                                            {renderStudentList(stats.breakfast)}
                                        </td>
                                        <td className="p-4 border border-gray-700 bg-gray-800/50">
                                            {renderStudentList(stats.lunch)}
                                        </td>
                                        <td className="p-4 border border-gray-700 bg-gray-800/50">
                                            {renderStudentList(stats.dinner)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CookDashboard;
