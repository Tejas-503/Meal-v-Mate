import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  UtensilsCrossed, LayoutDashboard, Armchair,
  ClipboardList, ChefHat, BarChart3, LogOut, Menu
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/staff/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/staff/orders", icon: ClipboardList, label: "Manage Orders" },
  { path: "/staff/seats", icon: Armchair, label: "Manage Seats" },
  { path: "/staff/menu", icon: ChefHat, label: "Manage Menu" },
  { path: "/staff/analytics", icon: BarChart3, label: "Analytics" },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-700/50 border border-gray-600/30 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-gray-200" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white">Meal<span className="text-brand-bright">Mate</span></span>
            <p className="text-xs text-gray-500">Staff Portal</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-3 px-2">Navigation</p>
        <nav className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={`w-full ${location.pathname === path ? "sidebar-item-active" : "sidebar-item"}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-app-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-xl bg-gray-700/30 border border-gray-600/30 flex items-center justify-center text-gray-300 font-bold text-sm">
            S
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user?.username}</p>
            <p className="text-gray-500 text-xs">Canteen Staff</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r border-app-border bg-app-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col bg-app-card border-r border-app-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-app-border bg-app-card">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-app-border transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-white">Meal<span className="text-brand-bright">Mate</span></span>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
