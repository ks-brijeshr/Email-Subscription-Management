import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import apiConfig from "../../api-config";


const AddSubscriptionList = () => {
    const [name, setName] = useState<string>("");

    const [allowBusinessEmailOnly, setAllowBusinessEmailOnly] = useState<boolean>(false);
    const [blockTemporaryEmail, setBlockTemporaryEmail] = useState<boolean>(false);
    const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(false);
    const [checkDomainExistence, setCheckDomainExistence] = useState<boolean>(false);
    const [verifyDnsRecords, setVerifyDnsRecords] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false); // For loading state

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No authentication token found. Please log in.");
            navigate("/login");
            return;
        }

        setLoading(true); // Show loading state

        try {
            const response = await axios.post(
              `${apiConfig.apiUrl}/subscription-list/create`,
              {
                name,
                allow_business_email_only: allowBusinessEmailOnly,
                block_temporary_email: blockTemporaryEmail,
                require_email_verification: requireEmailVerification,
                check_domain_existence: checkDomainExistence,
                verify_dns_records: verifyDnsRecords,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Subscription List Created Successfully:", response.data);
            alert("Subscription List created successfully!");
            navigate("/admin/dashboard"); // Navigate to the dashboard after creation
        } catch (error: any) {
            console.error("Error creating subscription list:", error.response?.data || error.message);
            alert(`Failed to create subscription list: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    return (
        <div className="flex">
            <Sidebar setIsSidebarOpen={() => { }} />

            <main className="w-full transition-all duration-300 ml-64">
                <nav className="bg-gray-900 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm space-x-4">
                    <div className="flex space-x-80">
                        <h1 className="text-2xl font-semibold text-white">Add Subscription List</h1>
                    </div>
                    <a href="/admin/dashboard" className="text-white transition item-center ml-auto">Dashboard</a>
                </nav>


                {/* Centering the form */}

                <div className="flex justify-center items-center p-10 bg-gray-100 min-h-screen">
                    <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-2xl shadow-xl p-10 relative">

                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="absolute top-4 left-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition duration-300 shadow"
                            title="Back to Dashboard"
                        >
                            <img src="/back.svg" alt="Back" className="w-5 h-5" />
                        </button>

                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
                        📋 Add Subscription List
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Name Input */}
                            <div>
                                <label className="block text-m font-medium text-gray-700 mb-2">Name :</label>
                                <input
                                    type="text"
                                    placeholder="Enter Subscription List Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 text-gray-800"
                                    required
                                />
                            </div>

                           
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="allowBusinessEmailOnly"
                                        checked={allowBusinessEmailOnly}
                                        onChange={() => setAllowBusinessEmailOnly(!allowBusinessEmailOnly)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="allowBusinessEmailOnly" className="ml-3 text-gray-700">Allow Business Email Only</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="blockTemporaryEmail"
                                        checked={blockTemporaryEmail}
                                        onChange={() => setBlockTemporaryEmail(!blockTemporaryEmail)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="blockTemporaryEmail" className="ml-3 text-gray-700">Block Temporary Email</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="requireEmailVerification"
                                        checked={requireEmailVerification}
                                        onChange={() => setRequireEmailVerification(!requireEmailVerification)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="requireEmailVerification" className="ml-3 text-gray-700">Require Email Verification</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="checkDomainExistence"
                                        checked={checkDomainExistence}
                                        onChange={() => setCheckDomainExistence(!checkDomainExistence)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="checkDomainExistence" className="ml-3 text-gray-700">Check Domain Existence</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="verifyDnsRecords"
                                        checked={verifyDnsRecords}
                                        onChange={() => setVerifyDnsRecords(!verifyDnsRecords)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="verifyDnsRecords" className="ml-3 text-gray-700">Verify DNS Records</label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition duration-300 ease-in-out shadow-sm hover:shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Add Subscription List'}
                            </button>

                        </form>
                    </div>
                </div>




            </main>
        </div>
    );
};

export default AddSubscriptionList;
