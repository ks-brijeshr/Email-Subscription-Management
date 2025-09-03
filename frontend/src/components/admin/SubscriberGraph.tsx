import { useQuery } from "@tanstack/react-query";
import { getSubscriberGrowthData } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SubscriberGraphProps {
  listId?: string; 
}

const SubscriberGraph: React.FC<SubscriberGraphProps> = ({ listId }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["subscriberGrowth", listId],
    queryFn: () => getSubscriberGrowthData(listId),
  });

  if (isLoading) return <p>Loading graph...</p>;
  if (error) return <p className="text-red-500">Error loading graph.</p>;

  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Subscriber Growth {listId ? `(List: ${listId})` : "(All Lists)"}
        </h3>
        <div className="text-sm text-gray-400">Last 30 days</div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", fontSize: "14px" }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number) => [`${value} Subscribers`, "Count"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriberGraph;
