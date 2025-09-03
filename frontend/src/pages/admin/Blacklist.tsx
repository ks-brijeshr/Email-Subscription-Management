import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import { getSubscriptionLists, getBlacklistedEmails } from "../../services/api";

interface BlacklistedEmail {
  id: number;
  email: string;
  reason: string;
  blacklisted_by: string;
  created_at: string;
}

const Blacklist = () => {
  const [emails, setEmails] = useState<BlacklistedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 5,
    currentPage: 1,
    lastPage: 1,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [subscriptionLists, setSubscriptionLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionLists();
  }, []);

  useEffect(() => {
    fetchBlacklisted(page, selectedListId);
  }, [page, selectedListId]);

  const fetchBlacklisted = async (currentPage = 1, listId = "") => {
    try {
      setLoading(true);
      const data = await getBlacklistedEmails(currentPage, perPage, listId);
      console.log(data);
      if (Array.isArray(data.blacklisted_emails)) {
        setEmails(data.blacklisted_emails);
        setPagination(data.pagination || {});
        setPage(currentPage);
      } else {
        console.error("Unexpected response format:", data);
        setEmails([]);
      }
    } catch (error) {
      console.error("Error loading blacklisted emails:", error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionLists = async () => {
    try {
      const response = await getSubscriptionLists();
      if (response) {
        setSubscriptionLists(response);
      } else {
        setSubscriptionLists([]);
      }
    } catch (error) {
      console.error("Error fetching subscription lists:", error);
      setSubscriptionLists([]);
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 min-h-screen font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        } p-4 lg:p-6`}
      >
        {/* Enhanced Navbar */}
        <nav className="bg-white shadow-lg rounded-lg px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Open Sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-xl lg:text-2xl font-bold text-blue-600">
              Blacklisted Emails
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <a
              href="/admin/dashboard"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7m-9 2v7a2 2 0 002 2h4a2 2 0 002-2v-7"
                />
              </svg>
              Back to Dashboard
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <div className="mt-6 max-w-6xl mx-auto">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-200 relative">
            {/* Back Button */}
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="absolute top-6 left-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-300 shadow"
              title="Back to Dashboard"
              aria-label="Go Back"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-semibold text-blue-600 mb-8 text-center">
              🚫 Blacklisted Emails
            </h2>

            {/* Subscription List Dropdown */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription List
              </label>
              <div className="relative">
                <select
                  value={selectedListId}
                  onChange={(e) => {
                    setSelectedListId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 appearance-none"
                >
                  <option value="">-- All Lists --</option>
                  {subscriptionLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Blacklisted Emails List */}
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : emails.length === 0 ? (
              <p className="text-center text-gray-600 py-10">
                No blacklisted emails found.
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {emails.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M18.364 5.636l-12.728 12.728m12.728 0L5.636 5.636"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-800">
                            {item.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span>{" "}
                            {item.reason}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Blacklisted By:</span>{" "}
                            {item.blacklisted_by}
                          </p>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Blacklisted At:</span>{" "}
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.lastPage > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600 text-sm">
                      Page {pagination.currentPage} of {pagination.lastPage} (Total: {pagination.total} emails)
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.lastPage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blacklist;