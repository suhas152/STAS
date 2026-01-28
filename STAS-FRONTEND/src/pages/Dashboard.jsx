import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CookDashboard from './CookDashboard';
import WardDashboard from './WardDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <div className="text-center mt-10">Please login to view dashboard.</div>;
    }

    if (user.role === 'admin') {
        return <AdminDashboard />;
    } else if (user.role === 'cook') {
        return <CookDashboard />;
    } else if (user.role === 'student') {
        return <StudentDashboard />;
    } else if (user.role === 'ward') {
        return <WardDashboard />;
    } else {
        return <div>Unknown role</div>;
    }
};

export default Dashboard;
