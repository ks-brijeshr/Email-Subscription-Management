import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import apiConfig from "../api-config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${apiConfig.apiUrl}/password-reset`, { email });
      setMessage("Password reset link sent! Please check your email.");
      setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirect to login after 3 seconds
    } catch (err: any) {
      setMessage("Failed to send reset link. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 font-sans text-gray-900">
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-wide">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
            Email
          </span>{" "}
          Manager
        </h1>

        <div className="flex items-center space-x-6">
          
          <nav className="flex space-x-2">
            <Link
              to="/"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 py-10">
        <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="absolute top-6 left-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-300 shadow"
            title="Back to Login"
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

          {/* Forgot Password Form */}
          <h2 className="text-2xl lg:text-3xl font-semibold text-blue-600 mb-6 text-center">
            Forgot Password
          </h2>

          {message && (
            <div
              className={`${
                message.includes("Failed")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              } px-4 py-2 rounded-lg mb-6 text-center text-sm`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                  onChange={handleChange}
                  required
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              )}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;