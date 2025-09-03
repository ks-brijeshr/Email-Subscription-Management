type DashboardStatsProps = {
  stats: {
    totalSubscribers: number;
    totalBlacklisted: number;
    totalSubscriptionLists: number;
  };
};

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="w-full py-10 px-6 bg-[#f8f9fc]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

        {/* Total Subscribers */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v1a6 6 0 1012 0V8a6 6 0 00-6-6zM5 8a5 5 0 1110 0v1a5 5 0 11-10 0V8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Total Subscribers</h4>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalSubscribers}</p>
            </div>
          </div>
        </div>

        {/* Total Blacklisted */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a7 7 0 100 14A7 7 0 009 2zM8 4h2v5H8V4zm0 6h2v2H8v-2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Blacklisted Emails</h4>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalBlacklisted}</p>
            </div>
          </div>
        </div>

        {/* Subscription Lists */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v3H4V3zM3 8h14v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Subscription Lists</h4>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalSubscriptionLists}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;
