import React, { useEffect, useState } from "react";
import { getAdminActivityLogs } from "../../services/api";

interface ActivityLogsProps {
  listId?: string;
}

const ActivityLogs = ({ listId }: ActivityLogsProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 8;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAdminActivityLogs({ listId, page: currentPage, perPage });
      setLogs(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error("Failed to load activity logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Reset to first page when listId changes
  }, [listId, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination on listId change
  }, [listId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Recent Activity Logs
        </h3>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No activity logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-600">
                    {index + 1 + (currentPage - 1) * perPage}
                  </td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="px-4 py-1 text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
