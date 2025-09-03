import { useEffect, useState } from "react";
import axios from "axios";
import apiConfig from "../../api-config";

const EmailVerificationStatus = () => {
  const [stats, setStats] = useState({ total_verified: 0, total_failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token missing");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${apiConfig.apiUrl}/email-verification-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats", err);
        setError("Failed to load verification stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const total = stats.total_verified + stats.total_failed;
  const verifiedPercentage =
    total > 0 ? (stats.total_verified / total) * 100 : 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-600 text-sm font-bold px-2 py-1 rounded">
            📧
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Email Verification
          </h3>
        </div>
        <span className="text-xs text-gray-500 italic">
          {verifiedPercentage.toFixed(1)}% Verified
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-gray-300 overflow-hidden mb-2">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${verifiedPercentage}%` }}
            ></div>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm mt-1">
            <span className="text-green-600 font-medium">
              ✅ {stats.total_verified} Verified
            </span>
            <span className="text-yellow-600 font-medium">
              ⏳ {stats.total_failed} Pending
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailVerificationStatus;
