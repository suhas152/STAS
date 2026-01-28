import { useState, useContext, useEffect } from 'react';
import { api, API_BASE_URL } from '../lib/api';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, login } = useContext(AuthContext); 
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contactNumber: '',
        fatherName: '',
        motherName: '',
        gothram: '',
        age: '',
        address: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const { data } = await api.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    password: '',
                    contactNumber: data.contactNumber || '',
                    fatherName: data.fatherName || '',
                    motherName: data.motherName || '',
                    gothram: data.gothram || '',
                    age: data.age || '',
                    address: data.address || ''
                });
                if (data.profileImage) {
                    setPreview(`${API_BASE_URL}${data.profileImage}`);
                } else {
                    setPreview(null);
                }
            } catch (err) {
                if (user) {
                    setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        password: '',
                        contactNumber: user.contactNumber || '',
                        fatherName: user.fatherName || '',
                        motherName: user.motherName || '',
                        gothram: user.gothram || '',
                        age: user.age || '',
                        address: user.address || ''
                    });
                    if (user.profileImage) {
                        setPreview(`${API_BASE_URL}${user.profileImage}`);
                    }
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        const token = localStorage.getItem('token');
        const config = {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('contactNumber', formData.contactNumber);
        data.append('fatherName', formData.fatherName);
        data.append('motherName', formData.motherName);
        data.append('gothram', formData.gothram);
        data.append('age', formData.age);
        data.append('address', formData.address);
        if (profileImage) {
            data.append('profileImage', profileImage);
        }

        try {
            const res = await api.put('/api/auth/profile', data, config);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            setMessage('Profile updated successfully! Reloading...');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 font-sans flex justify-center items-start pt-20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 relative z-10"
            >
                <h1 className="text-3xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Your Profile
                </h1>

                {message && (
                    <div className="bg-green-900/50 border border-green-500 text-green-300 p-3 rounded mb-4 text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 bg-gray-700">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-4xl">👤</div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg">
                                <span className="text-sm">📷</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-bold">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-bold">Age</label>
                            <input
                                type="number"
                                name="age"
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-bold">Father's Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.fatherName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-bold">Mother's Name</label>
                            <input
                                type="text"
                                name="motherName"
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                                value={formData.motherName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Gothram</label>
                        <input
                            type="text"
                            name="gothram"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.gothram}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Contact Number</label>
                        <input
                            type="text"
                            name="contactNumber"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.contactNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">Address</label>
                        <textarea
                            name="address"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors h-24"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter address"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">New Password <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span></label>
                        <input
                            type="password"
                            name="password"
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white p-3 rounded font-bold transition duration-200 shadow-lg"
                    >
                        Update Profile
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
