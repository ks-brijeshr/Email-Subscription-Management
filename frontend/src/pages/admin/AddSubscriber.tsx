import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiConfig from "../../api-config";

interface SubscriptionList {
  id: string;
  name: string;
}

const AddSubscriber = () => {
  const [subscriptionLists, setSubscriptionLists] = useState<
    SubscriptionList[]
  >([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [metadata, setMetadata] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionLists = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${apiConfig.apiUrl}/subscription-lists`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.subscription_lists) {
          setSubscriptionLists(response.data.subscription_lists);
        }
      } catch (error) {
        console.error("Error fetching subscription lists:", error);
      }
    };

    fetchSubscriptionLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedList || !email) {
      alert("Please select a subscription list and enter an email.");
      return;
    }
    setLoading(true); // Show loading state

    try {
      const token = localStorage.getItem("token");

      // Convert metadata from "key: value" format to JSON
      let formattedMetadata: Record<string, string> = {};
      if (metadata) {
        metadata.split(",").forEach((item) => {
          const [key, value] = item.split(":").map((str) => str.trim());
          if (key && value) {
            formattedMetadata[key] = value;
          }
        });
      }

      console.log("Submitting Data:", {
        name,
        email,
        metadata: formattedMetadata,
        list_id: selectedList,
      });

      const response = await axios.post(
        `${apiConfig.apiUrl}}/api/subscriptions/${selectedList}/subscribers`,
        {
          name,
          email,
          metadata: formattedMetadata,
          subscription_list_id: selectedList,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Subscriber Added Successfully:", response.data);
      alert("Subscriber added successfully!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error(
        "Error adding subscriber:",
        error.response?.data || error.message
      );
      alert(
        `Failed to add subscriber: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="flex">
      {/* <Sidebar setIsSidebarOpen={() => { }} /> */}

      <main className="w-full transition-all duration-300 ml-64">
        <nav className="bg-gray-900 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-white">
              Add Subscriber
            </h1>
          </div>
          <a
            href="/admin/dashboard"
            className="text-white transition item-center ml-auto"
          >
            Dashboard
          </a>
        </nav>

        {/* Centering the form */}

        <div className="flex justify-center items-center p-6 bg-gray-50 min-h-screen">
          <div className="w-full max-w-3xl bg-white border border-gray-300 rounded-2xl shadow-xl p-8 relative">
            {/* Back Button */}
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="absolute top-4 left-4 p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition duration-300"
            >
              <img src="/back.svg" alt="Back" className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              👤 Add Subscriber
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subscription List Dropdown */}
              <div>
                <label className="block text-m font-medium text-gray-700 mb-3">
                  Subscription List
                </label>
                <select
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  required
                >
                  <option value="">Select Subscription List</option>
                  {subscriptionLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-m font-medium text-gray-700 mb-3">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-m font-medium text-gray-700 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Metadata Input */}
              <div>
                <label className="block text-m font-medium text-gray-700 mb-3">
                  Metadata
                </label>
                <input
                  type="text"
                  placeholder="e.g. city: Surat, role: Admin"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                />
                <small className="text-gray-500 block mt-2">
                  Use format: <i>key: value, key: value</i>
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition duration-300 ease-in-out shadow-sm hover:shadow-md ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Subscriber"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddSubscriber;
