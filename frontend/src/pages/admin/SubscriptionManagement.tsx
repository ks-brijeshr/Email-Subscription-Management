import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import { deleteSubscriber } from "../../services/api";
import apiConfig from "../../api-config";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  tags?: string[];
}

interface SubscriptionList {
  id: string | null;
  name: string;
  allow_business_email_only: boolean;
  block_temporary_email: boolean;
  require_email_verification: boolean;
  check_domain_existence: boolean;
  verify_dns_records: boolean;
  created_at: string;
}

const SubscriptionManagement = () => {
  const [subscriptionLists, setSubscriptionLists] = useState<SubscriptionList[]>([]);
  const [listPage, setListPage] = useState<number>(1);
  const [listTotal, setListTotal] = useState<number>(0);
  const [listTotalPages, setListTotalPages] = useState<number>(1);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<string | null>(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalSubscribers, setTotalSubscribers] = useState<number>(0);

  const [emailSearch, setEmailSearch] = useState<string>("");
  const [tagSearch, setTagSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscriberDetails, setSelectedSubscriberDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [metadata, setMetadata] = useState<string>("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editSubscriptionList, setEditSubscriptionList] = useState<SubscriptionList | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [currentListName, setCurrentListName] = useState("");

  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const [newList, setNewList] = useState<Omit<SubscriptionList, "id">>({
    name: "",
    allow_business_email_only: false,
    block_temporary_email: false,
    require_email_verification: false,
    check_domain_existence: false,
    verify_dns_records: false,
    created_at: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionLists(listPage);
  }, [listPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedListId && selectedListName) {
        fetchSubscribers(selectedListId, selectedListName, page);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedListId, selectedListName, page]);

  useEffect(() => {
    if (selectedListId) {
      fetchSubscribers(selectedListId, selectedListName || "", 1);
    }
  }, [selectedListId, emailSearch, tagSearch, statusFilter]);

  const fetchSubscriptionLists = async (currentPage = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${apiConfig.apiUrl}/subscription-lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, per_page: 5 },
        }
      );

      if (response.data.subscription_lists) {
        setSubscriptionLists(response.data.subscription_lists.data);
        setListPage(response.data.subscription_lists.current_page);
        setListTotalPages(response.data.subscription_lists.last_page);
        setListTotal(response.data.subscription_lists.total);
      }
    } catch (error) {
      console.error("Error fetching subscription lists:", error);
    }
  };

  const fetchSubscribers = async (
    listId: string,
    listName: string,
    currentPage = 1,
    filtersOverride?: { email?: string; tag?: string; status?: string }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const params = {
        page: currentPage,
        perPage: perPage,
        email: filtersOverride?.email ?? emailSearch,
        tag: filtersOverride?.tag ?? tagSearch,
        status: filtersOverride?.status ?? statusFilter,
      };

      const response = await axios.get(
        `${apiConfig.apiUrl}/subscribers/${listId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (response.data?.subscribers) {
        const subscribers = response.data.subscribers;
        setSubscribers(subscribers);
        setSelectedListId(listId);
        setSelectedListName(listName);

        const pagination = response.data.pagination || {};
        setTotalPages(pagination.lastPage || 1);
        setPage(pagination.currentPage || 1);
        setTotalSubscribers(pagination.total || 0);

        if (currentPage === 1) {
          const stats = response.data.stats || {};
          setTotalStats({
            total: stats.total || 0,
            active: stats.active || 0,
            inactive: stats.inactive || 0,
          });
        }

        if (subscribers.length === 0) {
          setTotalPages(0);
        }
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const handleCopyList = async (list: SubscriptionList) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const newListData = {
      name: `${list.name} (Copy)`,
      allow_business_email_only: list.allow_business_email_only,
      block_temporary_email: list.block_temporary_email,
      require_email_verification: list.require_email_verification,
      check_domain_existence: list.check_domain_existence,
      verify_dns_records: list.verify_dns_records,
    };

    try {
      const createListResponse = await axios.post(
        `${apiConfig.apiUrl}/subscription-list/create`,
        newListData,
        { headers }
      );

      const newList = createListResponse.data.subscription_list;

      const subscribersResponse = await axios.get(
        `${apiConfig.apiUrl}/subscriptions/${list.id}/subscribers`,
        { headers }
      );

      const subscribers = subscribersResponse.data.subscribers || [];

      for (const subscriber of subscribers) {
        const payload = {
          name: subscriber.name,
          email: subscriber.email,
          metadata: subscriber.metadata,
          status: subscriber.status,
        };

        try {
          await axios.post(
            `${apiConfig.apiUrl}/subscriptions/${newList.id}/subscribers`,
            payload,
            { headers }
          );
        } catch (error) {
          console.error(`Failed to copy subscriber: ${subscriber.email}`, error);
        }
      }

      setSubscriptionLists((prev) => [...prev, newList]);
      alert(`✅ Subscription list and ${subscribers.length} subscribers copied successfully!`);
    } catch (error) {
      console.error("Error copying subscription list or subscribers:", error);
      alert("❌ Failed to copy subscription list or its subscribers.");
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) {
      alert("Invalid subscription list ID.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this subscription list?");
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
      setListTotal((prevTotal) => prevTotal - 1);

      if (subscriptionLists.length === 1 && listPage > 1) {
        setListPage((prev) => prev - 1);
        fetchSubscriptionLists(listPage - 1);
      } else {
        fetchSubscriptionLists(listPage);
      }
    } catch (error) {
      console.error("Error deleting subscription list:", error);
      alert("Failed to delete subscription list.");
    }
  };

  const handleEditClick = (list: SubscriptionList) => {
    setEditingListId(list.id);
    setEditSubscriptionList({
      id: list.id,
      name: list.name,
      allow_business_email_only: list.allow_business_email_only,
      block_temporary_email: list.block_temporary_email,
      require_email_verification: list.require_email_verification,
      check_domain_existence: list.check_domain_existence,
      verify_dns_records: list.verify_dns_records,
      created_at: list.created_at,
    });
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditSubscriptionList(null);
  };

  const handleEditSubmit = async () => {
    if (!editSubscriptionList || !editingListId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token");

      await axios.put(
        `${apiConfig.apiUrl}/subscription-lists/${editingListId}`,
        editSubscriptionList,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubscriptionLists((prev) =>
        prev.map((list) =>
          list.id === editingListId ? { ...editSubscriptionList } : list
        )
      );

      handleCancelEdit();
    } catch (error) {
      console.error("Error updating subscription list:", error);
      alert("Update failed");
    }
  };

  const handleNameClick = async (subscriberId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const response = await axios.get(
        `${apiConfig.apiUrl}/subscriber/${subscriberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (data.success && data.subscriber) {
        setSelectedSubscriberDetails(data.subscriber);
        setIsModalOpen(true);
      } else {
        alert("Subscriber not found!");
      }
    } catch (error) {
      console.error("Error fetching subscriber details:", error);
      alert("Error fetching subscriber details!");
    }
  };

  const updateSubscriberStatus = async (
    subscriberId: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await axios.put(
        `${apiConfig.apiUrl}/subscribers/${subscriberId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (selectedListId) {
        fetchSubscribers(selectedListId, selectedListName || "");
      }
    } catch (error) {
      console.error("Error updating subscriber status:", error);
    }
  };

  const handleAddSubmitList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found.");
        return;
      }

      const response = await axios.post(
        `${apiConfig.apiUrl}/subscription-list/create`,
        newList,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubscriptionLists((prev) => [...prev, response.data.subscription_list]);
      setShowAddForm(false);
      setSuccessMessage("Subscription List added successfully!");
      setNewList({
        name: "",
        allow_business_email_only: false,
        block_temporary_email: false,
        require_email_verification: false,
        check_domain_existence: false,
        verify_dns_records: false,
        created_at: "",
      });
    } catch (error) {
      console.error("Error adding subscription list:", error);
      alert("Failed to add subscription list.");
    }
  };

  const handleAddTag = async () => {
    if (!selectedSubscriberId || !tagInput.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `${apiConfig.apiUrl}/subscribers/${selectedSubscriberId}/tags`,
        { tags: [tagInput] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTagInput("");
      setSelectedSubscriberId(null);

      if (selectedListId) {
        fetchSubscribers(selectedListId, selectedListName || "");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const exportSubscribers = async (format: "csv" | "json") => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !selectedListId || !selectedListName) return;

      const response = await axios.get(
        `${apiConfig.apiUrl}/subscriptions/${selectedListId}/export/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status === 204) {
        alert("There are no subscribers to export.");
        return;
      }

      if (response.status !== 200) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const error = JSON.parse(reader.result as string);
            alert(error.message || "Failed to export subscribers.");
          } catch {
            alert("Failed to export subscribers.");
          }
        };
        reader.readAsText(response.data);
        return;
      }

      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${selectedListName}_subscribers.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      alert("Something went wrong while exporting.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedListId || !email) {
      alert("❗ Please select a subscription list and enter an email.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please log in again.");
        return;
      }

      let formattedMetadata: Record<string, string> = {};
      if (metadata) {
        metadata.split(",").forEach((item) => {
          const [key, value] = item.split(":").map((str) => str.trim());
          if (key && value) {
            formattedMetadata[key] = value;
          }
        });
      }

      const response = await axios.post(
        `${apiConfig.apiUrl}/subscriptions/${selectedListId}/subscribers`,
        { name, email, metadata: formattedMetadata },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Subscriber Added Successfully!");
      setName("");
      setEmail("");
      setMetadata("");
      handleCloseModal();
      fetchSubscribers(selectedListId, selectedListName || "");
    } catch (error: any) {
      console.error("Error adding subscriber:", error.response?.data || error.message);
      if (error.response?.status === 409) {
        alert(`⚠️ The email "${email}" is already subscribed to this list.`);
      } else if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.message === "Email failed validation and has been blacklisted.") {
          alert(`🚫 Email failed validation and has been blacklisted.\nReasons:\n- ${errorData.errors?.join("\n- ")}`);
        } else {
          alert(`❌ Validation Error: ${errorData.message || "Invalid input data."}`);
        }
      } else if (error.response?.status === 403) {
        alert("❌ Unauthorized: You do not have permission to perform this action.");
      } else if (error.response?.status === 404) {
        alert("❌ Subscription list not found. Please try again.");
      } else {
        alert(`❌ Failed to add subscriber. Please try again later.\nError: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const emailMatch = s.email.toLowerCase().includes(emailSearch.toLowerCase());
    const tagKeywords = tagSearch.trim().toLowerCase().split(" ").filter(Boolean);
    const tagMatch =
      tagKeywords.length === 0 ||
      tagKeywords.every((keyword) =>
        s.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      );
    const statusMatch = statusFilter === "all" || s.status === statusFilter;
    return emailMatch && tagMatch && statusMatch;
  });

  const handleDeleteSubscriber = async (id: number) => {
    try {
      const subscriberToDelete = subscribers.find((sub) => Number(sub.id) === Number(id));
      const isActive = subscriberToDelete?.status === "active";

      await deleteSubscriber(id);

      setTotalStats((prev) => ({
        total: prev.total - 1,
        active: isActive ? prev.active - 1 : prev.active,
        inactive: !isActive ? prev.inactive - 1 : prev.inactive,
      }));

      setTotalSubscribers((prev) => prev - 1);

      if (subscribers.length === 1 && page > 1) {
        fetchSubscribers(selectedListId!, selectedListName!, page - 1, {
          email: emailSearch,
          tag: tagSearch,
          status: statusFilter,
        });
      } else {
        fetchSubscribers(selectedListId!, selectedListName!, page, {
          email: emailSearch,
          tag: tagSearch,
          status: statusFilter,
        });
      }
    } catch (error) {
      console.error("Failed to delete subscriber", error);
    }
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete all selected subscribers across the entire list?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiConfig.apiUrl}/subscribers/bulk-delete`,
        { ids: selectedSubscribers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Selected subscribers deleted successfully.");
      setSelectedSubscribers([]);
      fetchSubscribers(selectedListId!, selectedListName!, page);
    } catch (error) {
      console.error("Bulk delete failed", error);
      alert("Failed to delete selected subscribers.");
    }
  };

  const handleDeleteTag = async (subscriberId: number, tag: string) => {
    try {
      await axios.delete(`${apiConfig.apiUrl}/subscriber-tags`, {
        data: { subscriber_id: subscriberId, tag: tag },
      });

      setSubscribers((prev) =>
        prev.map((s) =>
          Number(s.id) === Number(subscriberId)
            ? { ...s, tags: (s.tags || []).filter((t) => t !== tag) }
            : s
        )
      );
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return alert("Please select a file.");
    if (!currentListId) return alert("No subscription list selected.");

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(
        `${apiConfig.apiUrl}/subscriptions/${currentListId}/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { message, imported, failed, errors } = response.data;
      let alertMessage = `✅ ${message}\nImported: ${imported}\nFailed: ${failed}`;
      if (errors && errors.length > 0) {
        alertMessage += `\n\n❌ Errors:\n${errors.map((err: any) => `${err.email || "Unknown email"} - ${err.reason}`).join("\n")}`;
      }

      alert(alertMessage);
      setSelectedFile(null);
      fetchSubscribers(currentListId, currentListName);
    } catch (error: any) {
      console.error("Import failed", error);
      alert(`❌ Import failed: ${error.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriberClick = () => {
    setShowAddSubscriberModal(true);
  };

  const handleCloseModal = () => {
    setShowAddSubscriberModal(false);
    setName("");
    setEmail("");
    setMetadata("");
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 min-h-screen font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"} p-4 lg:p-6`}
      >
        {/* Header Section */}
        <header className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg p-4 flex items-center justify-between sticky top-0 z-50 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
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
            <h1 className="text-lg lg:text-2xl font-bold text-blue-600">
              {selectedListId ? "Subscribers" : "Subscription Lists"}
            </h1>
          </div>
          <a
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-500 font-medium text-sm lg:text-base transition-colors"
          >
            Back to Dashboard
          </a>
        </header>

        {/* Main Content */}
        <div className="mt-6 max-w-7xl mx-auto">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200">
            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    selectedListId
                      ? (setSelectedListId(null), setSelectedListName(null))
                      : navigate("/admin/dashboard");
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-300"
                  title={selectedListId ? "Back to Lists" : "Back to Dashboard"}
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
                <h2 className="text-xl lg:text-2xl font-semibold text-blue-600">
                  {selectedListId ? `Subscribers for ${selectedListName || ""}` : "Subscription Lists"}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                {selectedListId && (
                  <>
                    <button
                      onClick={() => exportSubscribers("csv")}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export as CSV
                    </button>
                    <button
                      onClick={() => exportSubscribers("json")}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export as JSON
                    </button>
                  </>
                )}
                <button
                  onClick={selectedListId ? handleAddSubscriberClick : () => setShowAddForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {selectedListId ? "Add Subscriber" : "Add List"}
                </button>
              </div>
            </div>

            {/* Subscriber Stats and Filters */}
            {selectedListId && (
              <>
                <div className="mb-6">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                    <h3 className="text-lg font-semibold text-blue-600 mb-4">Subscriber Overview</h3>
                    <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 p-3 rounded-full">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a2 2 0 00-2-2h-3m-4-2H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Subscribers</p>
                          <p className="text-2xl font-bold text-blue-600">{totalStats.total}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-3 rounded-full">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Subscribers</p>
                          <p className="text-2xl font-bold text-green-600">{totalStats.active}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-500 p-3 rounded-full">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unsubscribers</p>
                          <p className="text-2xl font-bold text-red-600">{totalStats.inactive}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                    />
                    <svg
                      className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by tags (e.g., tag1 tag2)"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="bg-white border border-gray-300 p-2 rounded-lg w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-300 p-2 rounded-lg w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 mb-6">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Import Subscribers</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv,.json,.txt"
                      onChange={handleFileChange}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!selectedFile || loading}
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {loading ? "Importing..." : "Import"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in">
                <span>{successMessage}</span>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-white hover:text-gray-200 focus:outline-none"
                  aria-label="Close Notification"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Add Subscription List Modal */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4">Add Subscription List</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                      <input
                        type="text"
                        value={newList.name}
                        onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                        placeholder="Enter list name"
                      />
                    </div>
                    {[
                      { label: "Allow Business Email Only", key: "allow_business_email_only" },
                      { label: "Block Temporary Email", key: "block_temporary_email" },
                      { label: "Require Email Verification", key: "require_email_verification" },
                      { label: "Check Domain Existence", key: "check_domain_existence" },
                      { label: "Verify DNS Records", key: "verify_dns_records" },
                    ].map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(newList as any)[field.key]}
                          onChange={(e) => setNewList({ ...newList, [field.key]: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
                        />
                        <label className="text-sm text-gray-700">{field.label}</label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSubmitList}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                      Add List
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Subscriber Modal */}
            {showAddSubscriberModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4">
                    Add New Subscriber to {selectedListName}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
                        Metadata (key:value, key2:value2)
                      </label>
                      <input
                        type="text"
                        id="metadata"
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                        placeholder="e.g., city:New York, age:30"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {loading ? "Adding..." : "Add Subscriber"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Subscription List Modal */}
            {editingListId && editSubscriptionList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4">Edit Subscription List</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                      <input
                        type="text"
                        value={editSubscriptionList.name}
                        onChange={(e) =>
                          setEditSubscriptionList({ ...editSubscriptionList, name: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                        placeholder="Enter list name"
                      />
                    </div>
                    {[
                      { label: "Allow Business Email Only", key: "allow_business_email_only" },
                      { label: "Block Temporary Email", key: "block_temporary_email" },
                      { label: "Require Email Verification", key: "require_email_verification" },
                      { label: "Check Domain Existence", key: "check_domain_existence" },
                      { label: "Verify DNS Records", key: "verify_dns_records" },
                    ].map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(editSubscriptionList as any)[field.key]}
                          onChange={(e) =>
                            setEditSubscriptionList({ ...editSubscriptionList, [field.key]: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
                        />
                        <label className="text-sm text-gray-700">{field.label}</label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Lists Table */}
            {!selectedListId ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Business Email Only</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Block Temp Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Verification</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check Domain</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verify DNS</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptionLists.length > 0 ? (
                      subscriptionLists.map((list: SubscriptionList) => (
                        <tr key={list.id} className="hover:bg-gray-50 transition-colors">
                          <td
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => {
                              if (list.id) {
                                fetchSubscribers(list.id, list.name);
                                setCurrentListId(list.id);
                                setCurrentListName(list.name);
                              }
                            }}
                          >
                            {list.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{list.allow_business_email_only ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{list.block_temporary_email ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{list.require_email_verification ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{list.check_domain_existence ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{list.verify_dns_records ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(list.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(list)}
                                className="text-blue-600 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 transition"
                                title="Edit List"
                                aria-label="Edit List"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleCopyList(list)}
                                className="text-gray-600 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition"
                                title="Copy List"
                                aria-label="Copy List"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v4a1 1 0 001 1h4a1 1 0 001-1V7m0 0a2 2 0 110-4 2 2 0 010 4zm0 0H9m1.5 4H10.5M8 15v4a1 1 0 001 1h4a1 1 0 001-1v-4m0 0a2 2 0 110-4 2 2 0 010 4zm0 0H9" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(list.id)}
                                className="text-red-600 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition"
                                title="Delete List"
                                aria-label="Delete List"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No subscription lists found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {listTotalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      onClick={() => fetchSubscriptionLists(listPage - 1)}
                      disabled={listPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600 text-sm">
                      Page {listPage} of {listTotalPages} (Total: {listTotal} lists)
                    </span>
                    <button
                      onClick={() => fetchSubscriptionLists(listPage + 1)}
                      disabled={listPage === listTotalPages}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Bulk Delete Action */}
                {selectedSubscribers.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    >
                      Delete Selected ({selectedSubscribers.length})
                    </button>
                  </div>
                )}

                {/* Subscribers Table */}
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={async (e) => {
                            if (e.target.checked) {
                              const token = localStorage.getItem("token");
                              const response = await axios.get(
                                `${apiConfig.apiUrl}/subscription-lists/${selectedListId}/subscribers`,
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              const allSubscriberIds = response.data.subscribers.map((sub: { id: number }) => sub.id);
                              setSelectedSubscribers(allSubscriberIds);
                            } else {
                              setSelectedSubscribers([]);
                            }
                          }}
                          checked={selectedSubscribers.length === totalSubscribers && totalSubscribers > 0}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tags</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubscribers.length > 0 ? (
                      filteredSubscribers.map((subscriber: Subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.includes(subscriber.id)}
                              onChange={() => handleCheckboxToggle(subscriber.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => handleNameClick(Number(subscriber.id))}
                          >
                            {subscriber.name || "N/A"}
                            {isModalOpen && selectedSubscriberDetails && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10"
                                onClick={() => setIsModalOpen(false)}
                              >
                                <div
                                  className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-gray-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-500 focus:outline-none"
                                    aria-label="Close Modal"
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <h2 className="text-xl font-semibold text-blue-600 mb-4">Subscriber Details</h2>
                                  <div className="space-y-3 text-sm text-gray-700">
                                    <p><span className="font-medium">ID:</span> {selectedSubscriberDetails.id}</p>
                                    <p><span className="font-medium">Name:</span> {selectedSubscriberDetails.name || "N/A"}</p>
                                    <p><span className="font-medium">Email:</span> {selectedSubscriberDetails.email}</p>
                                    <p><span className="font-medium">Status:</span> {selectedSubscriberDetails.status}</p>
                                    <p>
                                      <span className="font-medium">Tags:</span>{" "}
                                      {selectedSubscriberDetails.tags?.length > 0
                                        ? selectedSubscriberDetails.tags.map((tag: string, index: number) => (
                                            <span
                                              key={index}
                                              className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                                            >
                                              {tag}
                                            </span>
                                          ))
                                        : "No tags"}
                                    </p>
                                    <p><span className="font-medium">Created At:</span> {selectedSubscriberDetails.created_at}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{subscriber.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                subscriber.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {subscriber.status === "active" ? (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {subscriber.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(subscriber.tags || []).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleDeleteTag(Number(subscriber.id), tag)}
                                    className="ml-1 -mr-0.5 h-4 w-4 text-blue-800 hover:text-blue-600 focus:outline-none"
                                    aria-label={`Remove tag ${tag}`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="mt-2">
                              {selectedSubscriberId === subscriber.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enter tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900 placeholder-gray-500"
                                  />
                                  <button
                                    onClick={handleAddTag}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition"
                                  >
                                    Add
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSelectedSubscriberId(subscriber.id)}
                                  className="text-green-600 hover:text-green-500 text-sm font-medium transition"
                                >
                                  Add Tag
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => updateSubscriberStatus(subscriber.id, subscriber.status)}
                                className="text-yellow-600 hover:text-yellow-500 p-1 rounded-full hover:bg-gray-100 transition"
                                title="Toggle Status"
                                aria-label="Toggle Subscriber Status"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0v4m-5 4h2m-2 4h2M9 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-5m-9 0h-2M15 21h2" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const confirmed = window.confirm("Are you sure you want to delete this subscriber?");
                                  if (confirmed) handleDeleteSubscriber(Number(subscriber.id));
                                }}
                                className="text-red-600 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition"
                                title="Delete Subscriber"
                                aria-label="Delete Subscriber"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No subscribers found for this list.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination for Subscribers */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      onClick={() =>
                        fetchSubscribers(selectedListId!, selectedListName!, page - 1, {
                          email: emailSearch,
                          tag: tagSearch,
                          status: statusFilter,
                        })
                      }
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600 text-sm">
                      Page {page} of {totalPages} (Total: {totalSubscribers} subscribers)
                    </span>
                    <button
                      onClick={() =>
                        fetchSubscribers(selectedListId!, selectedListName!, page + 1, {
                          email: emailSearch,
                          tag: tagSearch,
                          status: statusFilter,
                        })
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagement;