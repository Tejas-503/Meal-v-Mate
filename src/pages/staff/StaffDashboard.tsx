import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp, Package, Armchair, Clock,
  ChefHat, CheckCircle, AlertCircle, ArrowRight, IndianRupee
} from "lucide-react";
import { formatCurrency, formatDateTime, todayDate } from "@/lib/utils";
import type { Order, SeatBooking } from "@/types";

export default function StaffDashboard() {
  const navigate = useNavigate();

  const { data: todayOrders = [] } = useQuery<Order[]>({
    queryKey: ["staff-today-orders"],
    queryFn: async () => {
      const today = todayDate();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .order("created_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 20000,
  });

  const { data: todayBookings = [] } = useQuery<SeatBooking[]>({
    queryKey: ["staff-today-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .eq("booking_date", todayDate())
        .eq("status", "confirmed");
      return data || [];
    },
    refetchInterval: 20000,
  });

  const totalRevenue = todayOrders
    .filter((o) => o.payment_status === "paid" && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = todayOrders.filter((o) => o.status === "pending").length;
  const preparingOrders = todayOrders.filter((o) => o.status === "preparing").length;
  const readyOrders = todayOrders.filter((o) => o.status === "ready").length;
  const deliveredOrders = todayOrders.filter((o) => o.status === "delivered").length;

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Total Orders", value: todayOrders.length, icon: Package, color: "text-brand-bright", bg: "bg-brand/10 border-brand/20" },
    { label: "Seat Bookings", value: todayBookings.length, icon: Armchair, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  ];

  const quickActions = [
    { label: "Manage Orders", desc: "Update order status", icon: ChefHat, path: "/staff/orders", urgent: pendingOrders > 0, urgentCount: pendingOrders },
    { label: "Seat Bookings", desc: "View & manage bookings", icon: Armchair, path: "/staff/seats", urgent: false },
    { label: "Update Menu", desc: "Add or edit menu items", icon: Package, path: "/staff/menu", urgent: false },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Staff Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-card p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium">{label}</p>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", count: pendingOrders, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: "🕐" },
          { label: "Preparing", count: preparingOrders, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "👨‍🍳" },
          { label: "Ready", count: readyOrders, color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "🔔" },
          { label: "Delivered", count: deliveredOrders, color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: "✅" },
        ].map(({ label, count, color, icon }) => (
          <div key={label} className={`glass-card p-4 text-center border ${color.split(" ")[1]} ${color.split(" ")[2]}`}>
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className={`font-bold text-2xl ${color.split(" ")[0]}`}>{count}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ label, desc, icon: Icon, path, urgent, urgentCount }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="glass-card p-5 text-left hover:border-brand/40 hover:scale-[1.02] transition-all duration-200 group relative"
            >
              {urgent && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {urgentCount} new
                </span>
              )}
              <div className="w-10 h-10 bg-brand/20 border border-brand/30 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-bright" />
              </div>
              <h3 className="text-white font-bold mb-1">{label}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
              <div className="flex items-center gap-1 text-brand-bright text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">Recent Orders</h2>
          <button onClick={() => navigate("/staff/orders")} className="text-brand-bright text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {todayOrders.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">No orders yet today</div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-app-border">
              {todayOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-app-card-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-app-card-2 border border-app-border flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">#{order.id.slice(-6).toUpperCase()} · {order.student_name}</p>
                      <p className="text-gray-500 text-xs">{formatDateTime(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">{formatCurrency(order.total_amount)}</span>
                    <span className={`capitalize text-xs font-medium px-2 py-0.5 rounded-full border ${
                      order.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      order.status === "preparing" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      order.status === "ready" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      order.status === "delivered" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
