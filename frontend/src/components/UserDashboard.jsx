import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ViewAttendance from './ViewAttendance';
import ViewLeave from './ViewLeave';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLeaveApplications, setSelectedLeaveApplications] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/v1/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        toast.error('Error fetching user data');
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return <div>Loading...</div>;

  const { user, courses, attendanceRecords, leaveApplications } = userData;

  const handleViewAttendance = (courseId) => {
    setSelectedCourse(courseId);
    setShowAttendanceModal(true);
  };

  const handleViewLeave = (courseId, courseName) => {
    const filteredLeaveApplications = leaveApplications.filter(
      (leave) => leave.course === courseId
    );
    setSelectedCourse({ courseId, courseName });
    setSelectedLeaveApplications(filteredLeaveApplications);
    setShowLeaveModal(true);
  };

  const getAttendanceSummary = (courseId) => {
    const courseAttendance = attendanceRecords.filter(
      (record) => record.course === courseId
    );
    const totalPresent = courseAttendance.reduce(
      (total, record) => total + (record.attendanceStatus === 'present' ? 1 : 0),
      0
    );
    const totalAbsent = courseAttendance.reduce(
      (total, record) => total + (record.attendanceStatus === 'absent' ? 1 : 0),
      0
    );
    return { totalPresent, totalAbsent };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{user.name}'s Dashboard</h1>
      <table className="table-auto w-full border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Course Name</th>
            <th className="p-2">Total Present</th>
            <th className="p-2">Total Absent</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const { totalPresent, totalAbsent } = getAttendanceSummary(course._id);
            return (
              <tr key={course._id}>
                <td className="p-2">{course.courseName}</td>
                <td className="p-2">{totalPresent}</td>
                <td className="p-2">{totalAbsent}</td>
                <td className="p-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => handleViewAttendance(course._id)}
                  >
                    View Attendance
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => handleViewLeave(course._id, course.courseName)}
                  >
                    View Leaves
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <ViewAttendance
          courseId={selectedCourse}
          attendanceRecords={attendanceRecords.filter(
            (record) => record.course === selectedCourse
          )}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <ViewLeave
          courseId={selectedCourse.courseId}
          courseName={selectedCourse.courseName}
          userId={user._id}
          leaveApplications={selectedLeaveApplications}
          onClose={() => setShowLeaveModal(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
