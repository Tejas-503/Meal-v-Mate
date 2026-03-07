import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Armchair, ShoppingBag, Package, TrendingUp,
  Clock, ChevronRight, Utensils, ArrowRight
} from "lucide-react";
import { formatCurrency, formatDateTime, todayDate } from "@/lib/utils";
import type { Order, SeatBooking } from "@/types";
import OrderStatusStepper from "@/components/features/OrderStatusStepper";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: bookings = [] } = useQuery<SeatBooking[]>({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .eq("user_id", user!.id)
        .eq("booking_date", todayDate())
        .eq("status", "confirmed");
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status)
  );
  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const quickActions = [
    { icon: Armchair, label: "Book a Seat", desc: "Reserve your spot", path: "/student/seats", color: "from-blue-600/20 to-blue-800/20 border-blue-500/30" },
    { icon: ShoppingBag, label: "Order Food", desc: "Browse the menu", path: "/student/menu", color: "from-purple-600/20 to-purple-800/20 border-purple-500/30" },
    { icon: Package, label: "Track Orders", desc: "Check order status", path: "/student/orders", color: "from-green-600/20 to-green-800/20 border-green-500/30" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Welcome back, {user?.username?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Canteen Open</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: bookings.length, icon: Armchair, color: "text-brand-bright" },
          { label: "Active Orders", value: activeOrders.length, icon: Package, color: "text-yellow-400" },
          { label: "Total Orders", value: orders.length, icon: Utensils, color: "text-green-400" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: TrendingUp, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ icon: Icon, label, desc, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`glass-card p-5 text-left hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br ${color} group`}
            >
              <Icon className="w-8 h-8 text-white mb-4" />
              <h3 className="text-white font-bold text-lg mb-1">{label}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-4 group-hover:text-white transition-colors">
                Go <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-lg">Active Orders</h2>
            <button onClick={() => navigate("/student/orders")} className="text-brand-bright text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <span className="text-brand-bright font-bold">{formatCurrency(order.total_amount)}</span>
                </div>
                <OrderStatusStepper status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Bookings */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">Today's Seat Bookings</h2>
          <div className="flex flex-wrap gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="glass-card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center text-brand-bright font-bold">
                  {b.seat_number}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Seat {b.seat_number}</p>
                  <p className="text-gray-500 text-xs capitalize">{b.time_slot}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && bookings.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Ready to get started?</h3>
          <p className="text-gray-500 text-sm mb-6">Book a seat or order food from the canteen menu.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/student/seats")} className="btn-primary text-sm px-4 py-2">Book Seat</button>
            <button onClick={() => navigate("/student/menu")} className="btn-outline text-sm px-4 py-2">View Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
