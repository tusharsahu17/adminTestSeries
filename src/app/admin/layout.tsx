import Link from 'next/link';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
        <div className="p-6 text-xl font-bold tracking-wider border-b border-slate-700">
          ADMIN PANEL
        </div>
        
        <nav className="flex-1 p-4 space-y-2 font-medium">
          <Link 
            href="/admin" 
            className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Manage Users
          </Link>
          
          <div className="pt-8 mt-8 border-t border-slate-700">
            <Link 
              href="/dashboard" 
              className="block px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ← Back to App
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
