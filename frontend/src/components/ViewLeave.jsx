import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewLeave = ({ courseId, courseName, userId, leaveApplications, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/v1/user/applyLeave',
        {
          courseId,
          startDate,
          endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Leave application submitted successfully');
      onClose(); // Optionally close the modal after applying for leave
    } catch (error) {
      toast.error('Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Leave Details for {courseName}</h2>

        <div className="overflow-auto max-h-60"> {/* Scrollable wrapper */}
          <table className="table-auto w-full border border-gray-300 mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Leave Start Date</th>
                <th className="p-2">Leave End Date</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveApplications.length > 0 ? (
                leaveApplications.map((leave) => (
                  <tr key={leave._id}>
                    <td className="p-2">{new Date(leave.duration.startDate).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(leave.duration.endDate).toLocaleDateString()}</td>
                    <td className="p-2">{leave.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan="3">
                    No leave applications for this course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Apply for Leave Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Apply for Leave</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <button
            className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleApplyLeave}
            disabled={loading}
          >
            {loading ? 'Applying...' : 'Apply for Leave'}
          </button>
        </div>

        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewLeave;
