import React from 'react';

const ViewAttendance = ({ courseId, attendanceRecords, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Attendance Details for Course: {courseId}</h2>
        {/* Set a max height for the table and allow vertical scrolling */}
        <div className="max-h-64 overflow-y-auto">
          <table className="table-auto w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Attendance Date</th>
                <th className="p-2">Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record._id}>
                  <td className="p-2">{new Date(record.attendanceDate).toLocaleDateString()}</td>
                  <td className="p-2">{record.attendanceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewAttendance;
