import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, API_BASE_URL } from '../lib/api';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [view, setView] = useState('menu');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Menu State
    const [menu, setMenu] = useState({ breakfast: '', lunch: '', dinner: '' });
    const [isMenuLoading, setIsMenuLoading] = useState(false);
    
    // Stats State
    const [stats, setStats] = useState({ breakfast: [], lunch: [], dinner: [] });
    const [typeRecords, setTypeRecords] = useState([]);
    
    // Users State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isCreateWardModalOpen, setIsCreateWardModalOpen] = useState(false);
    const [wardData, setWardData] = useState({ name: '', email: '', password: '', contactNumber: '', role: 'ward' });

    // Movement State
    const [movements, setMovements] = useState([]);
    
    // Message State
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

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
            setStats(data || { breakfast: [], lunch: [], dinner: [] });
        } catch (error) {
            console.error(error);
        }
    }, [date, config]);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/api/auth/users', config);
            setUsers(data);
        } catch (error) {
            console.error(error);
            setMessage('Error fetching users');
        }
    }, [config]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/api/auth/users/${id}`, config);
            setMessage('User deleted successfully');
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error deleting user');
        }
    };

    const handleCreateWard = async (e) => {
        e.preventDefault();
        try {
            const endpoint = wardData.role === 'cook' ? 'create-cook' : 'create-ward';
            await api.post(`/api/auth/${endpoint}`, wardData, config);
            setMessage(`${wardData.role === 'cook' ? 'Cook' : 'Ward'} created successfully`);
            setIsCreateWardModalOpen(false);
            setWardData({ name: '', email: '', password: '', contactNumber: '', role: 'ward' });
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating user');
        }
    };

    const fetchMovements = useCallback(async () => {
        try {
            const { data } = await api.get('/api/movement', config);
            setMovements(data);
        } catch (error) {
            console.error(error);
        }
    }, [config]);

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

    const fetchTypeRecords = useCallback(async () => {
        try {
            const { data } = await api.get(`/api/attendance-types/all?date=${date}`, config);
            setTypeRecords(data || []);
        } catch (error) {
            console.error(error);
        }
    }, [date, config]);

    const refreshData = () => {
        if (view === 'menu') fetchMenu();
        if (view === 'attendance') {
            fetchStats();
            fetchTypeRecords();
        }
        if (view === 'general') {
            fetchTypeRecords();
        }
        if (view === 'users') fetchUsers();
        if (view === 'movements') fetchMovements();
    };

    useEffect(() => {
        if (view === 'menu') fetchMenu();
        if (view === 'attendance') {
            fetchStats();
            fetchTypeRecords();
        }
        if (view === 'general') {
            fetchTypeRecords();
        }
        if (view === 'users') fetchUsers();
        if (view === 'movements') fetchMovements();
    }, [view, date, fetchMenu, fetchStats, fetchTypeRecords, fetchUsers, fetchMovements]);

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
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                        Admin Dashboard
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
                            className="w-full bg-gray-800 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-red-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-4 flex-wrap">
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'menu' ? 'bg-red-600 shadow-lg shadow-red-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('menu')}
                        >
                            Manage Menu
                        </button>
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'attendance' ? 'bg-orange-600 shadow-lg shadow-orange-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('attendance')}
                        >
                            View Attendance
                        </button>
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'general' ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('general')}
                        >
                            General Attendance
                        </button>
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'users' ? 'bg-purple-600 shadow-lg shadow-purple-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('users')}
                        >
                            Manage Users
                        </button>
                        <button 
                            className={`px-6 py-3 rounded font-bold transition duration-200 ${view === 'movements' ? 'bg-teal-600 shadow-lg shadow-teal-500/50' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={() => setView('movements')}
                        >
                            Student Movements
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
                        <h2 className="text-2xl font-bold mb-6 text-red-300">Set Menu for {date}</h2>
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
                                className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 rounded font-bold transition duration-200"
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
                        <h2 className="text-2xl font-bold mb-6 text-orange-300">Attendance Sheet for {date}</h2>
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
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 text-orange-300">Ward Uploaded Attendance (approve or dismiss)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-900 text-left">
                                            <th className="p-4 border border-gray-700 text-gray-300">Student</th>
                                            <th className="p-4 border border-gray-700 text-gray-300">Type</th>
                                            <th className="p-4 border border-gray-700 text-gray-300">Status</th>
                                            <th className="p-4 border border-gray-700 text-gray-300">Photo</th>
                                            <th className="p-4 border border-gray-700 text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {typeRecords.filter(r => r.type !== 'general').map(r => (
                                            <tr key={r._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                                            {r.user?.profileImage ? (
                                                                <img src={`${API_BASE_URL}${r.user.profileImage}`} alt={r.user?.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-xs text-gray-400">👤</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{r.user?.name}</div>
                                                            <div className="text-xs text-gray-500 capitalize">{r.user?.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 capitalize">{r.type.replace('_', ' ')}</td>
                                                <td className="p-4">{r.status === 'verified' ? 'Verified' : (r.status === 'dismissed' ? 'Dismissed' : 'Yet to be verified by admin')}</td>
                                                <td className="p-4">
                                                    {r.photo ? (
                                                        <img 
                                                            src={`${API_BASE_URL}${r.photo}`} 
                                                            alt={r.type} 
                                                            className="w-24 h-16 object-cover rounded border border-gray-700 cursor-pointer hover:opacity-80 transition"
                                                            onClick={() => setSelectedImage(`${API_BASE_URL}${r.photo}`)}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">No photo</span>
                                                    )}
                                                </td>
                                                <td className="p-4 space-x-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await api.patch(`/api/attendance-types/${r._id}/verify`, {}, config);
                                                                setTypeRecords(prev => prev.map(x => x._id === r._id ? { ...data, user: x.user } : x));
                                                            } catch (e) {
                                                                console.error(e);
                                                            }
                                                        }}
                                                        disabled={r.status === 'verified'}
                                                        className={`px-4 py-2 rounded text-sm font-bold ${r.status === 'verified' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { data } = await api.patch(`/api/attendance-types/${r._id}/dismiss`, {}, config);
                                                                setTypeRecords(prev => prev.map(x => x._id === r._id ? { ...data, user: x.user } : x));
                                                            } catch (e) {
                                                                console.error(e);
                                                            }
                                                        }}
                                                        disabled={r.status === 'dismissed'}
                                                        className={`px-4 py-2 rounded text-sm font-bold ${r.status === 'dismissed' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'general' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-blue-300">General Attendance for {date}</h2>
                        <div className="mb-4 text-sm text-gray-300">
                            <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded">
                                {typeRecords.filter(r => r.type === 'general').length} marked
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {typeRecords.filter(r => r.type === 'general').map(r => (
                                <div key={r._id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                        {r.user?.profileImage ? (
                                            <img src={`${API_BASE_URL}${r.user.profileImage}`} alt={r.user?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-2xl text-gray-400">👤</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{r.user?.name}</div>
                                        <div className="text-sm text-gray-400">{r.user?.email}</div>
                                        <div className="mt-2 flex flex-col gap-2">
                                            <div>
                                                <span className={`text-xs px-2 py-1 rounded ${r.status === 'verified' ? 'bg-green-900 text-green-200' : r.status === 'dismissed' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                                    {r.status === 'verified' ? 'Verified' : r.status === 'dismissed' ? 'Dismissed' : 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const { data } = await api.patch(`/api/attendance-types/${r._id}/verify`, {}, config);
                                                            setTypeRecords(prev => prev.map(x => x._id === r._id ? { ...data, user: x.user } : x));
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }}
                                                    disabled={r.status === 'verified'}
                                                    className={`px-3 py-1 rounded text-xs font-bold ${r.status === 'verified' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const { data } = await api.patch(`/api/attendance-types/${r._id}/dismiss`, {}, config);
                                                            setTypeRecords(prev => prev.map(x => x._id === r._id ? { ...data, user: x.user } : x));
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }}
                                                    disabled={r.status === 'dismissed'}
                                                    className={`px-3 py-1 rounded text-xs font-bold ${r.status === 'dismissed' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {typeRecords.filter(r => r.type === 'general').length === 0 && (
                                <div className="text-gray-400 italic">No general attendance marked</div>
                            )}
                        </div>
                    </motion.div>
                )}

                {view === 'users' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-purple-300">Manage Users</h2>
                            <button 
                                onClick={() => setIsCreateWardModalOpen(true)}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-bold transition duration-200 shadow-lg flex items-center gap-2"
                            >
                                <span className="text-xl font-bold">+</span> Create Staff
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 text-left">
                                        <th className="p-4 border border-gray-700 text-gray-300">User</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Email</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Role</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr 
                                            key={user._id} 
                                            className={`border-b border-gray-700 hover:bg-gray-700/50 ${user.role === 'ward' ? 'bg-teal-900/20' : user.role === 'cook' ? 'bg-yellow-900/20' : user.role === 'student' ? 'bg-indigo-900/10' : ''}`}
                                        >
                                            <td className="p-4">
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                    onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                                                        {user.profileImage ? (
                                                            <img src={`${API_BASE_URL}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">👤</div>
                                                        )}
                                                    </div>
                                                    <div className="font-bold group-hover:text-blue-400 transition-colors">{user.name}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    className="text-blue-400 hover:underline"
                                                    onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}
                                                >
                                                    {user.email}
                                                </button>
                                            </td>
                                            <td className="p-4 capitalize">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ward' ? 'bg-teal-900 text-teal-200' : user.role === 'cook' ? 'bg-yellow-900 text-yellow-200' : user.role === 'student' ? 'bg-indigo-900 text-indigo-200' : 'bg-gray-900 text-gray-200'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {isUserModalOpen && selectedUser && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700">
                                            {selectedUser.profileImage ? (
                                                <img src={`${API_BASE_URL}${selectedUser.profileImage}`} alt={selectedUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-2xl text-gray-400">👤</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{selectedUser.name}</div>
                                            <div className="text-sm text-gray-400">{selectedUser.email}</div>
                                            <div className="mt-1">
                                                <span className={`text-xs px-2 py-1 rounded ${selectedUser.role === 'ward' ? 'bg-teal-900 text-teal-200' : selectedUser.role === 'cook' ? 'bg-yellow-900 text-yellow-200' : selectedUser.role === 'student' ? 'bg-indigo-900 text-indigo-200' : 'bg-gray-900 text-gray-200'}`}>
                                                    {selectedUser.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                            <div className="text-gray-400">Contact</div>
                                            <div className="font-semibold">{selectedUser.contactNumber || '-'}</div>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                            <div className="text-gray-400">Age</div>
                                            <div className="font-semibold">{selectedUser.age ?? '-'}</div>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                            <div className="text-gray-400">Father</div>
                                            <div className="font-semibold">{selectedUser.fatherName || '-'}</div>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                            <div className="text-gray-400">Mother</div>
                                            <div className="font-semibold">{selectedUser.motherName || '-'}</div>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                            <div className="text-gray-400">Gothram</div>
                                            <div className="font-semibold">{selectedUser.gothram || '-'}</div>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded border border-gray-700 col-span-2">
                                            <div className="text-gray-400">Address</div>
                                            <div className="font-semibold whitespace-pre-line">{selectedUser.address || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button 
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                            onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isCreateWardModalOpen && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
                                    <h3 className="text-xl font-bold mb-4 text-teal-300">Create New Staff</h3>
                                    <form onSubmit={handleCreateWard} className="space-y-4">
                                        <div className="flex gap-4 mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="role" 
                                                    value="ward" 
                                                    checked={wardData.role === 'ward'} 
                                                    onChange={e => setWardData({...wardData, role: e.target.value})}
                                                    className="accent-teal-500"
                                                />
                                                <span className="text-white">Ward</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="role" 
                                                    value="cook" 
                                                    checked={wardData.role === 'cook'} 
                                                    onChange={e => setWardData({...wardData, role: e.target.value})}
                                                    className="accent-yellow-500"
                                                />
                                                <span className="text-white">Cook</span>
                                            </label>
                                        </div>
                                        <input type="text" placeholder="Name" required value={wardData.name} onChange={e => setWardData({...wardData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-teal-500" />
                                        <input type="email" placeholder="Email" required value={wardData.email} onChange={e => setWardData({...wardData, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-teal-500" />
                                        <input type="password" placeholder="Password" required value={wardData.password} onChange={e => setWardData({...wardData, password: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-teal-500" />
                                        <input type="text" placeholder="Contact Number" required value={wardData.contactNumber} onChange={e => setWardData({...wardData, contactNumber: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-teal-500" />
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button type="button" onClick={() => setIsCreateWardModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition duration-200">Cancel</button>
                                            <button type="submit" className={`px-4 py-2 rounded font-bold transition duration-200 ${wardData.role === 'cook' ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-teal-600 hover:bg-teal-500'}`}>
                                                Create {wardData.role === 'cook' ? 'Cook' : 'Ward'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {view === 'movements' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-teal-300">Student Movements</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 text-left">
                                        <th className="p-4 border border-gray-700 text-gray-300">Student</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Status</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Checkout Time</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Reason</th>
                                        <th className="p-4 border border-gray-700 text-gray-300">Checkin Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map(log => (
                                        <tr key={log._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                                        {log.user?.profileImage ? (
                                                            <img src={`${API_BASE_URL}${log.user.profileImage}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-xs text-gray-400">👤</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{log.user?.name}</div>
                                                        <div className="text-xs text-gray-500">{log.user?.contactNumber}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'out' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                                    {log.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">{new Date(log.checkoutTime).toLocaleString()}</td>
                                            <td className="p-4 text-sm">{log.reason}</td>
                                            <td className="p-4 text-sm">{log.checkinTime ? new Date(log.checkinTime).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))}
                                    {movements.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500 italic">No movement logs found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {selectedImage && (
                    <div 
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={selectedImage} 
                            alt="Enlarged view" 
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-gray-700"
                        />
                        <button 
                            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                            onClick={() => setSelectedImage(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
