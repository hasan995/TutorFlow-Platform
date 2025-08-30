import React, { useEffect, useState } from "react";
import { getAdminSummary } from "../../api/api";

const Card: React.FC<{ title: string; value: number | string }> = ({
  title,
  value,
}) => (
  <div className="p-6 rounded-xl bg-white shadow">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSummary();
        setSummary(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Users" value={summary?.totals?.users || 0} />
        <Card title="Instructors" value={summary?.totals?.instructors || 0} />
        <Card title="Courses" value={summary?.totals?.courses || 0} />
        <Card
          title="Pending Requests"
          value={
            (summary?.pending?.instructor_requests || 0) +
            (summary?.pending?.courses || 0)
          }
        />
      </div>

      <div className="p-6 rounded-xl bg-white shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Approvals</h2>
          <a href="/admin/approvals" className="text-blue-600">
            View All
          </a>
        </div>
        <p className="text-gray-500 mt-2">
          Manage instructor and course approvals.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
