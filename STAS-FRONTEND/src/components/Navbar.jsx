import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dbStatus, setDbStatus] = useState('checking...');

    useEffect(() => {
        const checkDb = async () => {
            try {
                const { data } = await api.get('/api/health');
                setDbStatus(data.status === 'connected' ? '' : '');
            } catch (error) {
                setDbStatus('🔴 DB Disconnected');
            }
        };
        checkDb();
        const interval = setInterval(checkDb, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-700 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link to={user ? "/dashboard" : "/"} className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mr-4">STAS HOME</Link>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${dbStatus.includes('Connected') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{dbStatus}</span>
                </div>
                <div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300 hidden md:inline">Welcome, <span className="font-bold text-white">{user.name}</span></span>
                            <Link to="/profile" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition text-sm font-bold border border-gray-600">Profile</Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm font-bold shadow-lg shadow-red-900/50"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:text-blue-300 transition">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition font-bold">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
