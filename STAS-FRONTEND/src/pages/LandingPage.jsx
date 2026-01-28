import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
// Assuming the user will place the image in assets/history.jpg
// If not, we can use a placeholder or handle the import error gracefully
import historyImg from '../assets/Screenshot 2026-01-04 182846.png'; 

const LandingPage = () => {
    // Array of images for slideshow - currently using the one provided/placeholder
    // If the user adds more, they can be added here
    const images = [
        historyImg,
        // Add more image paths here if available
    ];

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentImage((prev) => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [images.length]);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Navigation / Login Button */}
            <nav className="absolute top-0 w-full p-6 flex justify-end z-20">
                <Link to="/login">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-bold shadow-lg hover:shadow-orange-500/50 transition-all"
                    >
                        Login
                    </motion.button>
                </Link>
            </nav>

            <div className="container mx-auto px-6 py-20 min-h-screen flex flex-col justify-center items-center">
                
                {/* Title */}
                <motion.h1 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400"
                >
                    Smt. Tummalapalli Annapurnamma Students Home Trust
                </motion.h1>

                <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-6xl">
                    
                    {/* Image Slideshow Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2 relative group"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 aspect-[4/3]">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent z-10"></div>
                            <motion.img 
                                key={currentImage}
                                src={images[currentImage]} 
                                alt="History" 
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/600x400/1f2937/white?text=History+Image"; // Fallback
                                }}
                            />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -z-10 top-4 -left-4 w-full h-full bg-orange-500/20 rounded-2xl blur-xl"></div>
                    </motion.div>

                    {/* Text Content Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full md:w-1/2 space-y-6 text-lg leading-relaxed text-gray-300"
                    >
                        <p className="border-l-4 border-orange-500 pl-6 italic bg-gray-800/30 p-4 rounded-r-lg backdrop-blur-sm">
                            <span className="text-orange-400 font-bold text-xl block mb-2">50 Years of Legacy</span>
                            50 years ago Dr. Tummalapalli Harinarayana an eminent Physician & Surgeon by profession, with a spirit for public service, righteousness and generosity, donated his entire property and even by passed many of his own kith and kin, established <span className="text-white font-semibold">“Smt. Tummalapalli Annapurnamma Students Home Trust”</span>, in the name of his wife Smt Annapurnamma, in Vijayawada in 1946, for the benefit of poor Brahmin students. Thus the Trust was formed with the objective of helping the larger Brahmin community youth with education and good futures.
                        </p>
                        
                        <p className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
                            Today, a dedicated team manages the Trust a non-profit organization, to achieve the aspirations of the founder.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
