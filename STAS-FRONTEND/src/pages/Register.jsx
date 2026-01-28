import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // default
        contactNumber: ''
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
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
                <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                    Create Account
                </h2>
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm font-bold">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-green-500 focus:outline-none transition-colors"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm font-bold">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-green-500 focus:outline-none transition-colors"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm font-bold">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-green-500 focus:outline-none transition-colors"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm font-bold">Contact Number</label>
                        <input
                            type="text"
                            name="contactNumber"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-green-500 focus:outline-none transition-colors"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm font-bold">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-green-500 focus:outline-none transition-colors"
                            disabled
                        >
                            <option value="student">Student</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Only student registration is allowed.</p>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white p-3 rounded font-bold transition duration-200 shadow-lg mt-4"
                    >
                        Register
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account? <Link to="/login" className="text-green-400 hover:underline">Login here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
