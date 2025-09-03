import { useState, useEffect, useRef } from "react";
import { getSubscriptionLists } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import axios from "../../routes/axiosInstance";
import apiConfig from "../../api-config";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
}

const SendMailPage = () => {
  const [subscriptionLists, setSubscriptionLists] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlMessage, setHtmlMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubscriptionLists();
    fetchEmailTemplates();
  }, []);

  const fetchSubscriptionLists = async () => {
    try {
      const response = await getSubscriptionLists();
      setSubscriptionLists(response || []);
    } catch (error) {
      console.error("Error fetching subscription lists:", error);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get(`${apiConfig.apiUrl}/email-templates`);
      setEmailTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = emailTemplates.find((t) => t.id === parseInt(templateId));
    if (template) {
      setSubject(template.subject);
      setHtmlMessage(template.body);
      if (messageRef.current) {
        messageRef.current.innerHTML = template.body;
      }
    }
  };

  const updateTemplateBeforeSend = async () => {
    if (!selectedTemplateId) return;
    try {
      await axios.put(`${apiConfig.apiUrl}/email-templates/${selectedTemplateId}`, {
        subject,
        body: htmlMessage,
      });
    } catch (error) {
      console.error("Error updating template before sending:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedListId) {
      alert("Please select a subscription list.");
      return;
    }

    if (!selectedTemplateId) {
      alert("Please select a template.");
      return;
    }

    if (!subject || !htmlMessage) {
      alert("Subject and Message are required.");
      return;
    }

    try {
      await updateTemplateBeforeSend();

      await axios.post(`${apiConfig.apiUrl}/send-template`, {
        subscription_list_id: parseInt(selectedListId),
        template_id: parseInt(selectedTemplateId),
        subject,
        body: htmlMessage,
      });

      alert("Emails sent successfully!");
      setSelectedListId("");
      setSelectedTemplateId("");
      setSubject("");
      setHtmlMessage("");
      if (messageRef.current) {
        messageRef.current.innerHTML = "";
      }
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Error sending email:", error);
      if (error.response?.data?.errors) {
        const errorMsgs = Object.values(error.response.data.errors).flat().join("\n");
        alert(`Validation failed:\n${errorMsgs}`);
      } else {
        alert("Failed to send emails. Please check your inputs.");
      }
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 min-h-screen font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"} p-4 lg:p-6`}>
        <nav className="bg-white shadow-lg rounded-lg px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl lg:text-2xl font-bold text-blue-600">Send Emails to Subscribers</h1>
          </div>
          <a
            href="/admin/dashboard"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v7a2 2 0 002 2h4a2 2 0 002-2v-7" />
            </svg>
            Back to Dashboard
          </a>
        </nav>

        <div className="mt-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-blue-600 mb-8 text-center">📧 Send Email to Subscribers</h2>

            {/* Subscription List */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription List</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select List --</option>
                {subscriptionLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Template --</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter subject"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div
                ref={messageRef}
                contentEditable
                className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm"
                onInput={(e) => setHtmlMessage(e.currentTarget.innerHTML)}
              />
              <p className="text-xs text-gray-500 mt-2">
                You can use placeholders like <code>{`{{name}}`}</code> and <code>{`{{unsubscribe_link}}`}</code>.
              </p>
            </div>

            {htmlMessage && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                <div
                  className="border border-gray-300 rounded-lg p-4 bg-white max-h-[400px] overflow-auto shadow-inner"
                  dangerouslySetInnerHTML={{ __html: htmlMessage }}
                />
              </div>
            )}

            <button
              onClick={handleSendEmail}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition"
            >
              Send Email
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SendMailPage;
