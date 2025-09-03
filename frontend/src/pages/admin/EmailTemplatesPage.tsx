import { useEffect, useState } from "react";
import axios from "../../routes/axiosInstance";
import apiConfig from "../../api-config";
import Sidebar from "../../components/admin/Sidebar";

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
}

const EmailTemplatesPage = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${apiConfig.apiUrl}/email-templates`);
                setTemplates(response.data.templates);
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <div className="flex bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 min-h-screen font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"
                    } p-4 lg:p-6`}
            >
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
                            Default Email Templates
                        </h1>
                    </div>

                    <a
                        href="/admin/dashboard"
                        className="text-blue-600 hover:text-blue-500 font-medium text-sm lg:text-base transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </header>

                <section className="mt-6">
                    {loading ? (
                        <p className="text-gray-500">Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <p className="text-gray-500">No templates found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-white shadow rounded-xl border border-gray-200 p-6"
                                >
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">
                                        {template.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Subject: {template.subject}
                                    </p>
                                    <div
                                        className="prose prose-sm max-w-none border p-4 rounded bg-gray-50"
                                        dangerouslySetInnerHTML={{ __html: template.body }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default EmailTemplatesPage;
