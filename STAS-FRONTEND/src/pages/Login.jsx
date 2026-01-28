import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 border border-gray-700 z-10"
            >
                <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Welcome Back
                </h2>
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-3 rounded font-bold transition duration-200 shadow-lg"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
