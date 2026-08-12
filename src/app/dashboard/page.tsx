export default function DashboardPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">User Dashboard</h1>
        <p className="text-gray-600">You are logged in as a standard user. Admin access is required to view the Admin Dashboard.</p>
      </div>
    </div>
  );
}
