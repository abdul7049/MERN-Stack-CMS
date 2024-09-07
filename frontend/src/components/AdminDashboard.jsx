import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserAttendance from './UserAttendance';
import UserLeave from './UserLeave';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null); // 'attendance' or 'leaves'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLeaveClick = (course) => {
    console.log('Check Leaves button clicked');
    setActiveComponent({
      name: 'leave',
      props: {
        courseName: course.courseName,
        courseId: course._id,
        userId: selectedUser.user?._id || 'N/A',
        userName: selectedUser.user?.name || 'N/A',
      },
    });
    setSelectedCourse(course);
  };

  const handleAttendanceClick = (course) => {
    console.log('Mark Attendance button clicked');
    setActiveComponent({
      name: 'attendance',
      props: {
        courseName: course.courseName,
        courseId: course._id,
        userId: selectedUser.user?._id || 'N/A',
        userName: selectedUser.user?.name || 'N/A',
      },
    });
    setSelectedCourse(course);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found. Redirecting to login.');
          return;
        }

        const response = await axios.get('http://localhost:4000/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data?.message || error.message);
      }
    };
    fetchUsers();
  }, []);

  const handleViewSummary = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/v1/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(response.data); // Ensure response.data has the correct structure
      setLoading(false);
    } catch (error) {
      setError('Error fetching user details');
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveComponent(null);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <table className="w-full border border-gray-400 table-auto">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">User ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Role</th>
            <th className="p-2">View Summary</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-400">
              <td className="p-2">{user._id}</td>
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <button
                  className={`rounded-md px-4 py-2 hover:bg-gray-200 ${user.role === 'admin' ? 'disabled bg-gray-400 cursor-not-allowed' : ''}`}
                  onClick={() => handleViewSummary(user._id)}
                  disabled={user.role === 'admin'}
                >
                  View Summary
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">User Details for {selectedUser.user?.name || 'Loading...'}</h3>
          <table className="w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="p-2">Course Name</th>
                <th className="p-2">Total Presents</th>
                <th className="p-2">Total Absents</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.courses?.map((course) => {
                const totalPresent = selectedUser.attendanceRecords?.filter(
                  (record) => record.course === course._id && record.attendanceStatus === 'present'
                ).length || 0;

                const totalAbsent = selectedUser.attendanceRecords?.filter(
                  (record) => record.course === course._id && record.attendanceStatus === 'absent'
                ).length || 0;

                return (
                  <tr key={course._id}>
                    <td className="p-2">{course.courseName}</td>
                    <td className="p-2">{totalPresent}</td>
                    <td className="p-2">{totalAbsent}</td>
                    <td className="p-2">
                      <button
                        className="rounded-md px-4 py-2 bg-green-500 text-white hover:bg-green-700"
                        onClick={() => handleLeaveClick(course)}
                      >
                        Check Leaves
                      </button>
                      <button
                        className="rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-700 ml-2"
                        onClick={() => handleAttendanceClick(course)}
                      >
                        Mark Attendance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Modals */}
      {activeComponent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-lg shadow-lg z-10 max-w-4xl w-full mx-4 md:mx-0 p-4">
            {activeComponent.name === 'leave' && <UserLeave {...activeComponent.props} onClose={handleCloseModal} />}
            {activeComponent.name === 'attendance' && <UserAttendance {...activeComponent.props} onClose={handleCloseModal} />}
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
