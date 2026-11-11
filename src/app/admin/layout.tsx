import './admin.css';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-theme">
      <div className="app">
        <AdminSidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
