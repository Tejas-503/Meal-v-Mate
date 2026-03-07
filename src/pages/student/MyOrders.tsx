import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import OrderStatusStepper from "@/components/features/OrderStatusStepper";
import { toast } from "sonner";
import { Package, ChevronDown, ChevronUp, Clock, X, AlertCircle } from "lucide-react";
import { formatCurrency, formatDateTime, canCancelOrder, getCancelCountdown } from "@/lib/utils";
import type { Order } from "@/types";

export default function MyOrders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [tick, setTick] = useState(0);

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filters = [
    { id: "all", label: "All Orders" },
    { id: "active", label: "Active" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filtered = orders.filter((o) => {
    if (filter === "active") return ["pending", "preparing", "ready"].includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-warning",
      preparing: "badge-info",
      ready: "badge-success",
      delivered: "badge-gray",
      cancelled: "badge-error",
    };
    return map[status] || "badge-gray";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-bright" /> My Orders
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your food orders</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-brand border-brand text-white"
                : "border-app-border text-gray-400 hover:border-brand/40 hover:text-white"
            }`}
          >
            {f.label}
            {f.id === "active" && orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length > 0 && (
              <span className="ml-1.5 bg-brand-light text-white text-xs font-bold px-1.5 rounded-full">
                {orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No orders found</p>
          <p className="text-gray-600 text-sm mt-1">Your orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const isExp = expanded === order.id;
            const canCancel = canCancelOrder(order.created_at) && !["cancelled", "delivered"].includes(order.status);
            const countdown = getCancelCountdown(order.created_at);

            return (
              <div key={order.id} className="glass-card overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-app-card-2 transition-colors"
                  onClick={() => setExpanded(isExp ? null : order.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-white font-bold text-sm">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={getStatusBadge(order.status) + " capitalize"}>
                        {order.status}
                      </span>
                      <span className="text-brand-bright font-bold">{formatCurrency(order.total_amount)}</span>
                      {isExp ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>

                  {/* Status Stepper */}
                  {!["cancelled"].includes(order.status) && (
                    <div className="mt-3 overflow-x-auto">
                      <OrderStatusStepper status={order.status} />
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExp && (
                  <div className="border-t border-app-border p-4 space-y-4">
                    {/* Order Items */}
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Items Ordered</p>
                      <div className="space-y-2">
                        {(order.order_items || []).map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-xs bg-app-card-2 border border-app-border rounded px-1.5 py-0.5">×{item.quantity}</span>
                              <span className="text-gray-300 text-sm">{item.item_name}</span>
                            </div>
                            <span className="text-white text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-app-border mt-3 pt-3 flex justify-between">
                        <span className="text-gray-400 font-medium">Total</span>
                        <span className="text-brand-bright font-bold text-lg">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Payment & Slot Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-app-card-2 rounded-xl p-3">
                        <p className="text-gray-600 text-xs mb-1">Payment</p>
                        <p className="text-white text-sm font-semibold capitalize">{order.payment_method || "—"}</p>
                        <span className={order.payment_status === "paid" ? "badge-success text-xs" : "badge-warning text-xs"}>
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="bg-app-card-2 rounded-xl p-3">
                        <p className="text-gray-600 text-xs mb-1">Pickup Slot</p>
                        <p className="text-white text-sm font-semibold capitalize">{order.time_slot || "—"}</p>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {canCancel && (
                      <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <p className="text-yellow-300 text-sm">Cancel within <strong className="text-yellow-200">{countdown}</strong></p>
                        </div>
                        <button
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    )}
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
