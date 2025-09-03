import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import DashboardStats from "../../components/admin/DashboardStats";
import ActivityLogs from "../../components/admin/ActivityLogs";
import SubscriberGraph from "../../components/admin/SubscriberGraph";
import NotificationBell from "../../components/admin/NotificationBell";
import { fetchDashboardStats } from "../../services/api";
import apiConfig from "../../api-config";

interface SubscriptionList {
  id: number;
  name: string;
}

const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning ☀️";
  if (hour < 18) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [subscriptionLists, setSubscriptionLists] = useState<SubscriptionList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (listId?: string) => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats(listId);
      setDashboardData(data);
    } catch (error) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${apiConfig.apiUrl}/admin/subscription-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubscriptionLists(response.data || []);
    } catch (error) {
      console.error("Failed to fetch subscription lists:", error);
    }
  };

  useEffect(() => {
    fetchStats(selectedListId);
  }, [selectedListId]);

  useEffect(() => {
    fetchSubscriptionLists();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className={`${isSidebarOpen ? "ml-64" : "ml-0"} w-full transition-all duration-300`}>
        {/* Navbar */}
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <img src="/options-icon.png" alt="Menu" className="w-7 h-7" />
              </button>
            )}
            <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-6 text-gray-700">
            <NotificationBell />

            <div className="text-right">
              <p className="font-medium">{getGreetingMessage()}</p>
              <p className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="p-8 bg-gradient-to-r from-gray-100 to-gray-200 min-h-[calc(100vh-64px)]">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500 font-semibold">{error}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left section */}
              <div className="lg:col-span-2 space-y-8">
                <DashboardStats stats={dashboardData} />
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
                  <SubscriberGraph listId={selectedListId || undefined} />
                </div>
              </div>

              {/* Right section */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all p-6">
                  <label
                    htmlFor="subscriptionList"
                    className="block text-base font-semibold text-gray-800 mb-3"
                  >
                    Filter by Subscription List
                  </label>
                  <select
                    id="subscriptionList"
                    value={selectedListId || ""}
                    onChange={(e) => setSelectedListId(e.target.value || undefined)}
                    className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">All Lists</option>
                    {subscriptionLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
                  <ActivityLogs listId={selectedListId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
