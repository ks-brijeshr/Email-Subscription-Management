import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get the current route

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <img src="/logo1.png" alt="Logo" className="w-10 h-10 object-contain" />
        <h1 className="text-2xl lg:text-2xl font-bold tracking-wide">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
            Email
          </span>{" "}
          Subscription Management
        </h1>
      </div>

      {/* Right side of the Navbar */}

      <div className="flex items-center space-x-6">
        {/* Navigation Links */}
        <nav className="flex space-x-2">
          <Link
            to="/"
            className={`px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300 ${
              location.pathname === "/" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            Home
          </Link>

          {location.pathname !== "/login" && (
            <Link
              to="/login"
              className={`px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300 ${
                location.pathname === "/login"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              Sign In
            </Link>
          )}

          {location.pathname !== "/signup" &&
            location.pathname !== "/login" && (
              <Link
                to="/signup"
                className={`px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition duration-300 ${
                  location.pathname === "/signup"
                    ? "text-blue-600 font-semibold"
                    : ""
                }`}
              >
                Sign Up
              </Link>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;