import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAttendance = ({ courseId, courseName, userId, userName, onClose }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [status, setStatus] = useState('present');

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found. Redirecting to login.');
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/v1/admin/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredRecords = response.data.attendanceRecords.filter(
          (record) => record.course === courseId
        );

        setAttendanceRecords(filteredRecords);
        setLoading(false);
      } catch (error) {
        setError('Error fetching attendance records');
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [courseId, userId]);

  const handleMarkAttendance = async () => {
    if (!attendanceDate) {
      alert('Please select a date.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:4000/api/v1/admin/user/${userId}/markAttendance`,
        {
          courseId,
          status,
          attendanceDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Re-fetch attendance records after marking
        const fetchAttendanceRecords = async () => {
          try {
            const response = await axios.get(`http://localhost:4000/api/v1/admin/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const filteredRecords = response.data.attendanceRecords.filter(
              (record) => record.course === courseId
            );

            setAttendanceRecords(filteredRecords);
          } catch (error) {
            setError('Error fetching attendance records');
          }
        };

        fetchAttendanceRecords();
      }
    } catch (error) {
      setError('Error marking attendance');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
      <div className="bg-white rounded-lg shadow-lg z-10 max-w-4xl w-full mx-4 md:mx-0">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Attendance for {courseName} - {userName}</h2>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="overflow-auto" style={{ maxHeight: '200px' }}>
            <table className="w-full border border-gray-400 table-auto mb-4">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Attendance Date</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id} className="border-b border-gray-400">
                    <td className="p-2">{new Date(record.attendanceDate).toLocaleDateString()}</td>
                    <td className="p-2">{record.attendanceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Mark Attendance</h3>
            <label className="block mb-2">
              Date:
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </label>
            <label className="block mb-2">
              Status:
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </label>
            <button
              onClick={handleMarkAttendance}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Mark Attendance
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAttendance;
