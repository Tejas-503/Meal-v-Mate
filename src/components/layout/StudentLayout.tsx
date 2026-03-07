import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  UtensilsCrossed, LayoutDashboard, Armchair,
  ShoppingBag, Package, LogOut, Menu, X, ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const navItems = [
  { path: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/student/seats", icon: Armchair, label: "Book Seats" },
  { path: "/student/menu", icon: ShoppingBag, label: "Order Food" },
  { path: "/student/orders", icon: Package, label: "My Orders" },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
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
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white">Food<span className="text-brand-bright">Hub</span></span>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={`w-full ${location.pathname === path ? "sidebar-item-active" : "sidebar-item"}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{label}</span>
              {label === "Order Food" && totalItems > 0 && (
                <span className="ml-auto bg-brand text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-app-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-bright font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-app-border bg-app-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col bg-app-card border-r border-app-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-app-border bg-app-card">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-app-border transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-white">Food<span className="text-brand-bright">Hub</span></span>
          <button onClick={() => navigate("/student/menu")} className="relative text-gray-400 hover:text-white p-2 rounded-lg hover:bg-app-border transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
