import { useState, useEffect, useCallback } from 'react';
import { api, API_BASE_URL } from '../lib/api';

const TYPES = [
  { key: 'morning_study', label: 'Morning Study Hour Attendance' },
  { key: 'evening_prayer', label: 'Evening Prayer Attendance' },
  { key: 'night_study', label: 'Night Study Hour Attendance' }
];

const WardDashboard = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [files, setFiles] = useState({});
  const [records, setRecords] = useState({});
  const [movements, setMovements] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchMy = useCallback(async (d = date) => {
    try {
      const { data } = await api.get('/api/attendance-types/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const byType = {};
      data.filter(r => r.date.startsWith(d)).forEach(r => {
        byType[r.type] = r;
      });
      setRecords(byType);
    } catch (e) {
      console.error(e);
    }
  }, [date, token]);

  const fetchMovements = useCallback(async () => {
    try {
      const { data } = await api.get('/api/movement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovements(data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
      fetchMy();
      fetchMovements();
  }, [fetchMy, fetchMovements]);

  const handleDateChange = async (d) => {
    setDate(d);
    await fetchMy(d);
  };

  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const upload = async (type) => {
    setMessage('');
    const form = new FormData();
    form.append('date', date);
    form.append('type', type);
    if (!files[type]) {
      setMessage('Photo is required');
      return;
    }
    form.append('photo', files[type]);
    try {
      const { data } = await api.post('/api/attendance-types/ward', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setRecords(prev => ({ ...prev, [type]: data }));
      setMessage('Uploaded successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Ward Dashboard</h1>
          <div className="flex items-center gap-4">
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-blue-500 focus:outline-none"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded" onClick={() => fetchMy()}>Refresh</button>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500 text-blue-300 rounded">{message}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TYPES.map(t => {
            const r = records[t.key];
            return (
              <div key={t.key} className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">{t.label}</h2>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(t.key, e.target.files[0])}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                  <button
                    onClick={() => upload(t.key)}
                    className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 font-bold"
                  >
                    Upload Photo
                  </button>
                  <div className="text-sm text-gray-400">
                    Status: {r ? (r.status === 'verified' ? 'Verified by admin' : (r.status === 'dismissed' ? 'Dismissed by admin' : 'Yet to be verified by admin')) : 'No record'}
                  </div>
                  {r?.photo && (
                    <div className="mt-2">
                      <img src={`${API_BASE_URL}${r.photo}`} alt={t.label} className="w-full h-40 object-cover rounded border border-gray-700" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
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
        </div>
      </div>
    </div>
  );
};

export default WardDashboard;
