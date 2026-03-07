import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { BarChart3, IndianRupee, Package, TrendingUp, Users, Calendar } from "lucide-react";
import { formatCurrency, todayDate } from "@/lib/utils";
import type { Order, SeatBooking } from "@/types";

type Range = "today" | "week" | "month" | "custom";

function getDateRange(range: Range, from: string, to: string) {
  const now = new Date();
  if (range === "today") {
    const t = todayDate();
    return { from: t, to: t };
  }
  if (range === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { from: start.toISOString().split("T")[0], to: todayDate() };
  }
  if (range === "month") {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return { from: start.toISOString().split("T")[0], to: todayDate() };
  }
  return { from, to };
}

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const STATUS_COLORS: Record<string, string> = {
  delivered: "#22c55e",
  preparing: "#3b82f6",
  ready: "#a855f7",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

export default function Analytics() {
  const [range, setRange] = useState<Range>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = getDateRange(range, customFrom, customTo);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["analytics-orders", from, to],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`)
        .neq("status", "cancelled")
        .order("created_at");
      return data || [];
    },
  });

  const { data: bookings = [] } = useQuery<SeatBooking[]>({
    queryKey: ["analytics-bookings", from, to],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .gte("booking_date", from)
        .lte("booking_date", to)
        .eq("status", "confirmed");
      return data || [];
    },
  });

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Daily revenue chart
  const dailyMap: Record<string, number> = {};
  orders.forEach((o) => {
    const day = o.created_at.split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + o.total_amount;
  });
  const dailyData = Object.entries(dailyMap).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    revenue: parseFloat(revenue.toFixed(2)),
  }));

  // Status breakdown
  const allOrders = useQuery<Order[]>({
    queryKey: ["analytics-all-orders", from, to],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status")
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`);
      return data || [];
    },
  });

  const statusMap: Record<string, number> = {};
  (allOrders.data || []).forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Top items
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    (o.order_items || []).forEach((item) => {
      if (!itemMap[item.item_name]) itemMap[item.item_name] = { name: item.item_name, qty: 0, revenue: 0 };
      itemMap[item.item_name].qty += item.quantity;
      itemMap[item.item_name].revenue += item.price * item.quantity;
    });
  });
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const ranges: { id: Range; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
    { id: "custom", label: "Custom" },
  ];

  const tooltipStyle = {
    backgroundColor: "#0a0f1e",
    border: "1px solid #1a2a4a",
    borderRadius: "8px",
    color: "#e2e8f0",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-bright" /> Analytics & Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Revenue insights and performance metrics</p>
      </div>

      {/* Range Selector */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                range === r.id ? "bg-brand border-brand text-white" : "border-app-border text-gray-400 hover:border-brand/40"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {range === "custom" && (
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">From</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input-dark text-sm py-2" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">To</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input-dark text-sm py-2" />
            </div>
          </div>
        )}
        <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {from} → {to}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "text-green-400", bg: "border-green-500/20 bg-green-500/5" },
          { label: "Total Orders", value: orders.length, icon: Package, color: "text-brand-bright", bg: "border-brand/20 bg-brand/5" },
          { label: "Avg Order Value", value: formatCurrency(avgOrder), icon: TrendingUp, color: "text-purple-400", bg: "border-purple-500/20 bg-purple-500/5" },
          { label: "Seat Bookings", value: bookings.length, icon: Users, color: "text-yellow-400", bg: "border-yellow-500/20 bg-yellow-500/5" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-card p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Revenue Chart */}
          {dailyData.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold text-lg mb-6">Daily Revenue</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Pie */}
            {statusData.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold text-lg mb-6">Order Status</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[entry.status] || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend formatter={(v) => <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Items */}
            {topItems.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold text-lg mb-4">Top Selling Items</h2>
                <div className="space-y-3">
                  {topItems.map((item, idx) => {
                    const maxQty = topItems[0]?.qty || 1;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs w-4">{idx + 1}</span>
                            <span className="text-white text-sm font-medium truncate max-w-[160px]">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-brand-bright text-sm font-bold">{item.qty} sold</span>
                            <span className="text-gray-500 text-xs ml-2">({formatCurrency(item.revenue)})</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-app-card-2 rounded-full">
                          <div
                            className="h-1.5 bg-gradient-to-r from-brand to-brand-bright rounded-full transition-all"
                            style={{ width: `${(item.qty / maxQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {orders.length === 0 && (
            <div className="glass-card p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold">No data for this period</p>
              <p className="text-gray-600 text-sm mt-1">Orders will appear here once placed</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
