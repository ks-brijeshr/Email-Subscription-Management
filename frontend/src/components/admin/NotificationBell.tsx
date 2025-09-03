import { useEffect, useState, useRef } from "react";
import axios from "axios";
import apiConfig from "../../api-config";

interface Notification {
    id: number;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(`${apiConfig.apiUrl}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Notification fetch failed:", err);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            await axios.put(`${apiConfig.apiUrl}/notifications/mark-as-read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch (err) {
            console.error("Mark as read failed:", err);
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-200 transition"
                aria-label="Notifications"
            >
                {/* Static Bell SVG */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 
            14.158V11a6.002 6.002 0 00-4-5.659V5a2 
            2 0 00-4 0v.341C7.67 6.165 6 8.388 6 
            11v3.159c0 .538-.214 1.055-.595 
            1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 
            0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-xl z-50 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500">No notifications</p>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 text-sm ${n.read ? "bg-white" : "bg-gray-50"}`}
                                >
                                    <p className="font-medium text-gray-800">{n.title}</p>
                                    <p className="text-gray-600">{n.message}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
