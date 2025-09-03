import { Link } from "react-router-dom";
import { subscribeUser } from "../services/api";
import { useState } from "react";

const handleSmoothScroll = (sectionId: any) => {
  document.querySelector(sectionId)?.scrollIntoView({
    behavior: "smooth",
  });
};

const Home = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await subscribeUser(name, email);
      setMessage("Successfully subscribed to the newsletter!");
      setName("");
      setEmail("");
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data.message || "An error occurred.";

        if (status === 400) {
          setError("Invalid email address. Only business emails are allowed.");
        } else if (status === 409) {
          setError(
            serverMessage ||
              "This email is already subscribed to our newsletter."
          );
        } else {
          setError(serverMessage);
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans scroll-smooth">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-5 bg-gray-900 text-white shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center space-x-3">
          <img
            src="/logo1.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-bold tracking-wide hover:text-blue-500 transition duration-300">
            <span className="text-blue-500">Email</span> Subscription Management
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-8 hidden md:flex">
          <button
            onClick={() => handleSmoothScroll("#features")}
            className="hover:text-blue-400 transition duration-300"
          >
            Features
          </button>
          <button
            onClick={() => handleSmoothScroll("#howitworks")}
            className="hover:text-blue-400 transition duration-300"
          >
            How It Works
          </button>
          <button
            onClick={() => handleSmoothScroll("#pricing")}
            className="hover:text-blue-400 transition duration-300"
          >
            Pricing
          </button>
          <Link
            to="/login"
            className="hover:text-blue-400 transition duration-300"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition duration-300 shadow"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/*Section with Blurred Background Image */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Background Blurred Image */}
        <img
          src="/email.png"
          alt="Blurred Background"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-20 blur-2xl scale-125 pointer-events-none z-0"
        />

        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl transition-all duration-300">
            Simplify <span className="text-blue-600">Email Subscriptions</span>{" "}
            for Your Users
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl">
            Automate, track, and manage all your email subscribers from one
            simple dashboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-500 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-100 text-gray-900 text-lg font-medium rounded-lg hover:bg-gray-200 transition duration-300 shadow-md transform hover:scale-105"
            >
              Already Have an Account?
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="py-20 bg-gray-100 px-6 transition-all duration-500"
      >
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Powerful Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Powerful bulk email tool",
              icon: "bulk-emails.svg",
              desc: "Schedule and trigger emails to subscribers based on tags and activity.",
            },
            {
              title: "Track Subscribers growth",
              icon: "Track-subscriber.svg",
              desc: "Monitor subscriber growth and keep your list clean effortlessly.",
            },
            {
              title: "Secure & Compliant",
              icon: "secure.svg",
              desc: "Rate-limit, Security & compliance monitoring.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 text-center"
            >
              <img
                src={`/features/${f.icon}`}
                alt={f.title}
                className="w-14 h-14 mb-4 mx-auto"
              />
              <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="howitworks" className="py-20 bg-white px-6">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          How It Works
        </h3>
        <div className="max-w-4xl mx-auto grid gap-12 md:grid-cols-3 text-center">
          {["Create Subscription Lists", "Add Subscribers", "Send & Track"].map(
            (step, i) => (
              <div key={i} className="transition duration-300 hover:scale-105">
                <div className="text-blue-600 text-5xl font-bold mb-4">
                  {i + 1}
                </div>
                <h4 className="text-lg font-semibold mb-2">{step}</h4>
                <p className="text-gray-600">
                  {i === 0
                    ? "Organize subscribers into smart, tag-based groups."
                    : i === 1
                    ? "Import contacts or add manually with easy-to-use tools."
                    : "Send emails, monitor responses, and manage unsubscribes."}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-100 px-6">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Pricing Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              features: [
                "500 subscribers",
                "1 subscription list",
                "Basic analytics",
              ],
              primary: false,
            },
            {
              name: "Pro",
              price: "$19",
              features: [
                "5,000 subscribers",
                "10 lists",
                "Advanced analytics",
                "Unsubscribe tracking",
              ],
              primary: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              features: [
                "Unlimited subscribers",
                "API Access",
                "Priority support",
              ],
              primary: false,
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-lg shadow-md text-center transition-all duration-300 transform ${
                plan.primary
                  ? "bg-blue-600 text-white scale-105"
                  : "bg-white text-gray-900"
              }`}
            >
              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <p className="text-2xl font-semibold mb-4">
                {plan.price}
                {plan.price !== "Custom" && (
                  <span className="text-sm">/month</span>
                )}
              </p>
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
              <button
                className={`px-5 py-2 rounded ${
                  plan.primary
                    ? "bg-white text-blue-600 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                } transition duration-300`}
              >
                {plan.name === "Enterprise" ? "Contact Us" : "Start Now"}
              </button>
            </div>
          ))}
        </div>
      </section>
      {/* Newsletter Subscription Section */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left Side: Heading */}
          <div className="md:w-1/2 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-600 text-lg">
              Stay updated with the latest features, updates, and offers.
            </p>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <form
              className="flex flex-col items-start w-full max-w-sm space-y-3"
              onSubmit={handleSubscribe}
            >
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
              <input
                type="email"
                placeholder="Enter Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500 transition duration-300 mt-2"
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
              {message && <p className="text-green-600 mt-2">{message}</p>}
              {error && <p className="text-red-600 mt-2">{error}</p>}
              <p className="text-xs text-gray-500 mt-2">
                By clicking the "Subscribe" button, you are agreeing to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Email Manager Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Tagline */}
          <div className="space-y-3">
            <img src="/logo1.png" alt="Logo" className="w-12 h-12" />
            <p className="font-bold text-white">
              Simplify Email Subscriptions Manager
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="hover:text-white">
                Instagram
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
            </div>
            <p className="mt-4">Register with:</p>
            <a href="#" className="hover:text-white">
              LinkedIn
            </a>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold">Services</h4>
            <a href="#" className="block hover:text-white">
              Penetration Testing
            </a>
            <a href="#" className="block hover:text-white">
              AI Security
            </a>
            <a href="#" className="block hover:text-white">
              Data Privacy
            </a>
            <a href="#" className="block hover:text-white">
              Managed Security Services
            </a>
            <a href="#" className="block hover:text-white">
              Compliance
            </a>
            <a href="#" className="block hover:text-white">
              Configuration Assessment
            </a>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold">Resources</h4>
            <a href="#" className="block hover:text-white">
              Case Studies
            </a>
            <a href="#" className="block hover:text-white">
              Sample Reports
            </a>
            <a href="#" className="block hover:text-white">
              Leadership Insights
            </a>
            <a href="#" className="block hover:text-white">
              Technical Blogs
            </a>
            <a href="#" className="block hover:text-white">
              Schedule a Meet
            </a>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold">Company</h4>
            <a href="#" className="block hover:text-white">
              About us
            </a>
            <a href="#" className="block hover:text-white">
              Contact us
            </a>
            <a href="#" className="block hover:text-white">
              Our Team
            </a>
            <a href="#" className="block hover:text-white">
              Career
            </a>
            <a href="#" className="block hover:text-white">
              Training
            </a>
            <a href="#" className="block hover:text-white">
              Our Culture
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 border-t border-gray-700 pt-4">
          © 2025 Email Subscription Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
