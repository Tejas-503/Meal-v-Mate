import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ClipboardList, ChevronDown, ChevronUp, Search, RefreshCw } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types";
import OrderStatusStepper from "@/components/features/OrderStatusStepper";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "delivered", "cancelled"];
const FILTERS = ["all", "pending", "preparing", "ready", "delivered", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    preparing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ready: "bg-green-500/20 text-green-400 border-green-500/30",
    delivered: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`capitalize text-xs font-medium px-2.5 py-1 rounded-full border ${map[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
      {status}
    </span>
  );
}

export default function ManageOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["staff-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["staff-orders"] });
      qc.invalidateQueries({ queryKey: ["staff-today-orders"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = o.student_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-bright" /> Manage Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Update order status and track all orders</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-gray-400 hover:text-white border border-app-border hover:border-brand/40 px-3 py-2 rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search by student name or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark pl-10" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all capitalize ${
                filter === f ? "bg-brand border-brand text-white" : "border-app-border text-gray-400 hover:border-brand/40"
              }`}
            >
              {f} {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-app-border"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExp = expanded === order.id;
            return (
              <div key={order.id} className="glass-card overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-app-card-2 transition-colors"
                  onClick={() => setExpanded(isExp ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{order.student_name} · {order.student_email}</p>
                        <p className="text-gray-600 text-xs">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-bright font-bold">{formatCurrency(order.total_amount)}</span>
                      {isExp ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-app-border p-4 space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {(order.order_items || []).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.item_name} <span className="text-gray-600">×{item.quantity}</span></span>
                          <span className="text-white font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-app-border pt-2 flex justify-between">
                        <span className="text-gray-400 font-medium">Total</span>
                        <span className="text-brand-bright font-bold">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Status Stepper */}
                    {order.status !== "cancelled" && (
                      <div className="overflow-x-auto">
                        <OrderStatusStepper status={order.status} />
                      </div>
                    )}

                    {/* Update Status */}
                    {!["delivered", "cancelled"].includes(order.status) && (
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateMutation.mutate({ orderId: order.id, status: s })}
                              disabled={updateMutation.isPending}
                              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors capitalize disabled:opacity-50 ${
                                s === "cancelled"
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-brand/30 text-brand-bright hover:bg-brand/10"
                              }`}
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-app-card-2 rounded-xl p-3">
                        <p className="text-gray-600 text-xs mb-1">Payment</p>
                        <p className="text-white text-sm capitalize">{order.payment_method || "—"}</p>
                        <span className={order.payment_status === "paid" ? "badge-success text-xs" : "badge-warning text-xs"}>
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="bg-app-card-2 rounded-xl p-3">
                        <p className="text-gray-600 text-xs mb-1">Slot</p>
                        <p className="text-white text-sm capitalize">{order.time_slot || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
