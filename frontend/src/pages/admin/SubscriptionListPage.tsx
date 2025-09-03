import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import apiConfig from "../../api-config";

interface SubscriptionList {
  id: string;
  name: string;
  allow_business_email_only: boolean;
  block_temporary_email: boolean;
  require_email_verification: boolean;
  check_domain_existence: boolean;
  verify_dns_records: boolean;
}

const SubscriptionListPage = () => {
  const [subscriptionLists, setSubscriptionLists] = useState<SubscriptionList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editSubscriptionList, setEditSubscriptionList] = useState<SubscriptionList | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newList, setNewList] = useState<Omit<SubscriptionList, "id">>({
    name: "",
    allow_business_email_only: false,
    block_temporary_email: false,
    require_email_verification: false,
    check_domain_existence: false,
    verify_dns_records: false,
  });

  useEffect(() => {
    fetchSubscriptionLists();
  }, []);

  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${apiConfig.apiUrl}/subscription-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubscriptionLists(response.data.subscription_lists);
    } catch (error) {
      console.error("Error fetching subscription lists:", error);
      setError("Failed to fetch subscription lists.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this subscription list?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      await axios.delete(`${apiConfig.apiUrl}/subscription-lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubscriptionLists((prev) => prev.filter((list) => list.id !== id));
    } catch (error) {
      console.error("Error deleting subscription list:", error);
      alert("Failed to delete subscription list.");
    }
  };

  const handleEditClick = (list: SubscriptionList) => {
    setEditingListId(list.id);
    setEditSubscriptionList({ ...list });
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditSubscriptionList(null);
  };

  const handleEditSubmit = async () => {
    if (!editSubscriptionList) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      await axios.put(
        `${apiConfig.apiUrl}/subscription-lists/${editingListId}`,
        editSubscriptionList,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubscriptionLists((prev) =>
        prev.map((list) =>
          list.id === editingListId ? { ...editSubscriptionList } : list
        )
      );

      handleCancelEdit();
    } catch (error) {
      console.error("Error updating subscription list:", error);
      alert("Failed to update subscription list.");
    }
  };

  const handleAddSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      const response = await axios.post(
        `${apiConfig.apiUrl}/subscription-list/create`,
        newList,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubscriptionLists((prev) => [...prev, response.data.subscription_list]);
      setShowAddForm(false);
      setNewList({
        name: "",
        allow_business_email_only: false,
        block_temporary_email: false,
        require_email_verification: false,
        check_domain_existence: false,
        verify_dns_records: false,
      });
    } catch (error) {
      console.error("Error adding subscription list:", error);
      alert("Failed to add subscription list.");
    }
  };

  return (
    <div className="flex">
      <Sidebar setIsSidebarOpen={() => { }} />
      <main className="w-full ml-64">
        <nav className="bg-gray-900 border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Subscription Lists</h1>
          <a href="/admin/dashboard" className="text-white ml-auto">Dashboard</a>
        </nav>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800"></h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-9 mr-8"
          >
            + Add Subscription List
          </button>
        </div>

        <div className="p-6 bg-gray-100 min-h-screen">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg p-6">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-600 uppercase bg-gray-200">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Business Email Only</th>
                    <th className="px-4 py-3">Block Temp Email</th>
                    <th className="px-4 py-3">Email Verification</th>
                    <th className="px-4 py-3">Check Domain</th>
                    <th className="px-4 py-3">Verify DNS</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionLists.map((list, index) => (
                    <tr
                      key={list.id}
                      className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                    >

                      <td className="px-4 py-3">{list.name}</td>
                      <td className="px-4 py-3 text-center">{list.allow_business_email_only ? "✔" : "✘"}</td>
                      <td className="px-4 py-3 text-center">{list.block_temporary_email ? "✔" : "✘"}</td>
                      <td className="px-4 py-3 text-center">{list.require_email_verification ? "✔" : "✘"}</td>
                      <td className="px-4 py-3 text-center">{list.check_domain_existence ? "✔" : "✘"}</td>
                      <td className="px-4 py-3 text-center">{list.verify_dns_records ? "✔" : "✘"}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          className="px-3 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                          onClick={() => handleEditClick(list)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 text-red-600 bg-red-50 hover:bg-red-100 rounded"
                          onClick={() => handleDelete(list.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Subscription List Modal */}
          {showAddForm && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-8 shadow-lg w-[500px] max-w-full">
                <h2 className="text-xl font-semibold mb-4">Add Subscription List</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={newList.name}
                      onChange={(e) =>
                        setNewList({ ...newList, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                  </div>

                  {[
                    { label: "Allow Business Email Only", key: "allow_business_email_only" },
                    { label: "Block Temporary Email", key: "block_temporary_email" },
                    { label: "Require Email Verification", key: "require_email_verification" },
                    { label: "Check Domain Existence", key: "check_domain_existence" },
                    { label: "Verify DNS Records", key: "verify_dns_records" },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={(newList as any)[field.key]}
                        onChange={(e) =>
                          setNewList({
                            ...newList,
                            [field.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <label className="text-gray-700">{field.label}</label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Subscription List Modal */}
          {editSubscriptionList && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-8 shadow-lg w-[500px] max-w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Subscription List</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={editSubscriptionList.name}
                      onChange={(e) =>
                        setEditSubscriptionList({ ...editSubscriptionList, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                  </div>

                  {[
                    { label: "Allow Business Email Only", key: "allow_business_email_only" },
                    { label: "Block Temporary Email", key: "block_temporary_email" },
                    { label: "Require Email Verification", key: "require_email_verification" },
                    { label: "Check Domain Existence", key: "check_domain_existence" },
                    { label: "Verify DNS Records", key: "verify_dns_records" },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={(editSubscriptionList as any)[field.key]}
                        onChange={(e) =>
                          setEditSubscriptionList({
                            ...editSubscriptionList,
                            [field.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <label className="text-gray-700">{field.label}</label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SubscriptionListPage;
