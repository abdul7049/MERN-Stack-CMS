import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserLeave = ({ courseName, courseId, userId, onClose }) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:4000/api/v1/admin/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Filter leave applications based on courseId
        const filteredLeaves = response.data.leaveApplications.filter(
          (leave) => leave.course === courseId
        );

        setLeaveApplications(filteredLeaves);
      } catch (err) {
        setError('Error fetching leave applications');
        toast.error('Error fetching leave applications');
      }
    };

    fetchLeaveApplications();
  }, [courseId, userId]);

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        throw new Error('Invalid status value');
      }

      await axios.put(
        `http://localhost:4000/api/v1/admin/user/${userId}/updateLeave`,
        {
          leaveId,
          status: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state
      setLeaveApplications((prev) =>
        prev.map((leave) =>
          leave._id === leaveId ? { ...leave, status: newStatus } : leave
        )
      );

      toast.success('Leave status updated successfully!');
    } catch (err) {
      setError('Error updating leave status');
      toast.error('Error updating leave status');
    }
  };

  return (
    <div className="p-4 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">Leave Applications for {userId} in {courseName}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full border border-gray-300 table-auto mb-4">
            <thead>
              <tr className="bg-gray-200 text-left sticky top-0 z-10">
                <th className="p-2">Serial Number</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Leave Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveApplications.map((leave, index) => (
                <tr key={leave._id}>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{new Date(leave.duration.startDate).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(leave.duration.endDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <select
                      value={leave.status}
                      onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                      className="border border-gray-300 rounded p-2 w-full"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleStatusChange(leave._id, leave.status)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserLeave;
