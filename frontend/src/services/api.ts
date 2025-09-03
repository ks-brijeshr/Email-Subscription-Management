import axios from "axios";
import axiosInstance from "../routes/axiosInstance";
import apiConfig from "../api-config";

export const api = axiosInstance;

interface ActivityLogParams {
  listId?: string;
  page?: number;
  perPage?: number;
}

export const fetchDashboardStats = async (listId?: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${apiConfig.apiUrl}/admin/dashboard/stats`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: listId ? { subscription_list_id: listId } : {},
    }
  );
  return response.data;
};

export const getSubscriberGrowthData = async (listId?: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${apiConfig.apiUrl}/admin/dashboard/subscriber-growth`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: listId ? { subscription_list_id: listId } : {},
    }
  );
  return response.data; // Make sure backend gives array here
};

// export const fetchActivityLogs = async () => {
//   try {
//     const response = await axiosInstance.get("/admin/dashboard/activity-logs");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching activity logs:", error);
//     return [];
//   }
// };


export const getAdminActivityLogs = async ({ listId, page, perPage }: ActivityLogParams = {}) => {
  const response = await axiosInstance.get("/admin/dashboard/activity-logs", {
    params: {
      ...(listId && { subscription_list_id: listId }),
      ...(page && { page }),
      ...(perPage && { per_page: perPage }),
    },
  });
  return response.data;
};

export const getSubscriptionLists = async (page = 1, perPage = 5) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${apiConfig.apiUrl}/admin/subscription-lists`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, per_page: perPage },
    }
  );
  return response.data;
};





export const sendCustomEmail = async (data: {
  subscription_list_id: string;
  subject: string;
  body: string;
}) => {
  const response = await api.post("/admin/send-custom-email", data);
  return response.data;
};


export const getBlacklistedEmails = async (page = 1, perPage = 5, subscription_list_id = "") => {
  const response = await api.get("/admin/blacklisted-emails", {
    params: { page, perPage, subscription_list_id },
  });
  return response.data;
};


export const subscribeUser = async (name: string, email: string) => {
  const response = await axios.post(`${apiConfig.apiUrl}/subscribe`, {
    name,
    email,
  });

  return response.data;
};

// export const fetchSubscriptionLists = async () => {
//   const token = localStorage.getItem("token");
//   const res = await axios.get("${apiConfig.apiUrl}/admin/subscription-lists", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

// export const sendEmailsToSubscribers = async (payload: {
//   subscription_list_id: number;
//   subject: string;  
//   body: string;
// }) => {
//   const token = localStorage.getItem("token");
//   return await axios.post("${apiConfig.apiUrl}/admin/send-mails", payload, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };



// src/pages/services/api.ts

// frontend/src/services/api.ts

export const deleteSubscriber = async (id: number) => {
  return await fetch(`${apiConfig.apiUrl}/subscribers/${id}`, {
    method: "DELETE",
  });
};

// export const deleteSubscribers = async (ids: number[]) => {
//   try {
//     const response = await fetch('${apiConfig.apiUrl}/subscribers/bulk-delete', {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ ids }), // Send the array of IDs to delete
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to delete subscribers: ${response.statusText}`);
//     }

//     return await response.json(); // Assuming the server returns a JSON response
//   } catch (error) {
//     console.error('Error deleting subscribers:', error);
//     throw error;  // Throw the error again to propagate it
//   }
// };





export const fetchAPITokens = async () => {
  const response = await api.get("/api-tokens");
  return response.data;
};

export const createAPIToken = async (name: string) => {
  const response = await api.post("/api-tokens/create", { name });
  return response.data;
};

export const revokeAPIToken = async (id: number) => {
  await api.delete(`/api-tokens/${id}`);
};
