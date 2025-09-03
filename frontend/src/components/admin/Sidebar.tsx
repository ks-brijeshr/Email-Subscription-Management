import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../../routes/axiosInstance";
import APITokenManagement from "../../pages/admin/APITokenManagement";

interface SidebarProps {
  isOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [showAPITokenModal, setShowAPITokenModal] = useState(false);

  useEffect(() => {
    const updateUserName = () => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(userData?.name || "Admin");
    };

    updateUserName();

    const interval = setInterval(() => {
      updateUserName();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const openAPITokenModal = () => {
    setShowAPITokenModal(true);
  };

  const closeAPITokenModal = () => {
    setShowAPITokenModal(false);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout logging failed:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <aside
        className={`w-64 h-screen fixed flex flex-col justify-between z-50 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5">
          <h2 className="text-xl font-semibold text-blue-600 tracking-wide">
            Admin Panel
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition duration-300"
            title="Close Sidebar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <hr className="my-4 border-gray-200 mx-5" />

        {/* Navigation */}
        <nav className="space-y-1 px-5">
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${location.pathname === "/admin/dashboard"
              ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-sm">Dashboard</span>
          </Link>

          <Link
            to="/admin/manage-subscriptions"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${location.pathname === "/admin/manage-subscriptions"
              ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-sm">Manage Subscriptions</span>
          </Link>

          <Link
            to="/admin/blacklist"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${location.pathname === "/admin/blacklist"
              ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0a9 9 0 01-2.828 2.828M5.636 5.636a9 9 0 012.828-2.828m-.002 13.656h.002m-.002-3h.002m-.002-3h.002m-.002-3h.002m6 9h.002m-.002-3h.002m-.002-3h.002m-.002-3h.002m6 9h.002m-.002-3h.002m-.002-3h.002m-.002-3h.002"
              />
            </svg>
            <span className="text-sm">Blacklist</span>
          </Link>

          <Link
            to="/admin/send-mail"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${location.pathname === "/admin/send-mail"
              ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Send Email</span>
          </Link>

          <Link
            to="/admin/email-templates"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${location.pathname === "/admin/email-templates"
                ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M4 4h16v16H4V4zm0 4l8 5 8-5"
              />
            </svg>
            <span className="text-sm">Email Templates</span>
          </Link>


          <button
            onClick={openAPITokenModal}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 w-full text-left ${showAPITokenModal
              ? "bg-blue-50 border-l-4 border-blue-600 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:border-l-4 hover:border-blue-600 hover:text-blue-600"
              }`}
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
                d="M15 7a2 2 0 012 2m-2 0a2 2 0 012-2m-2 2h-2m0 0a2 2 0 012 2m-2-2a2 2 0 01-2-2m2 2v2m0 0a2 2 0 01-2 2m2-2a2 2 0 012-2m-4 6H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2h-2"
              />
            </svg>
            <span className="text-sm">API Token Management</span>
          </button>
        </nav>

        {/* Bottom */}
        <div className="px-5 pb-6 mt-auto">
          <hr className="my-4 border-gray-200" />
          <Link
            to="/profile"
            className="block px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-300"
          >
            <div className="text-sm text-gray-500 text-right">Admin</div>
            <div className="text-right text-gray-800 font-medium">
              {userName}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center space-x-2 p-3 rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 text-white w-full"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
      {showAPITokenModal && <APITokenManagement onClose={closeAPITokenModal} />}
    </>
  );
};

export default Sidebar;
