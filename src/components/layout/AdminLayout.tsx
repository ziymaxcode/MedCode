import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Briefcase, 
  BarChart3, 
  LogOut,
  Stethoscope
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminLayout = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-accent">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Enrollments', path: '/admin/enrollments', icon: GraduationCap },
    { name: 'Batches', path: '/admin/batches', icon: Users },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Placement', path: '/admin/placement', icon: Briefcase },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-accent">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <Stethoscope size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">MedCode</h1>
              <p className="text-[10px] text-primary-light font-medium tracking-wider uppercase">Admin Portal</p>
            </div>
          </Link>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-medium text-sm truncate">{profile?.full_name || user.email}</p>
          <p className="text-xs text-primary-light capitalize">{profile?.role?.replace('_', ' ')}</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
