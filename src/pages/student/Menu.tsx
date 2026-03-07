import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import PaymentModal from "@/components/features/PaymentModal";
import { toast } from "sonner";
import {
  ShoppingBag, Plus, Minus, ShoppingCart, X,
  Search, Trash2, Clock
} from "lucide-react";
import { formatCurrency, getTimeSlotShort } from "@/lib/utils";
import type { MenuItem } from "@/types";

const CATEGORIES = [
  { id: "all", label: "All Items", emoji: "🍽️" },
  { id: "breakfast", label: "Breakfast", emoji: "🌅" },
  { id: "lunch", label: "Lunch", emoji: "☀️" },
  { id: "snacks", label: "Snacks", emoji: "🍟" },
  { id: "beverages", label: "Beverages", emoji: "☕" },
];

const TIME_SLOTS = [
  { id: "breakfast", label: "Breakfast", time: "9 AM – 12 PM" },
  { id: "lunch", label: "Lunch", time: "1 PM – 3 PM" },
  { id: "evening", label: "Evening", time: "4 PM – 5:30 PM" },
];

export default function Menu() {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount } = useCart();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [timeSlot, setTimeSlot] = useState("breakfast");

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true)
        .order("category");
      return data || [];
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          student_name: user!.username,
          student_email: user!.email,
          total_amount: totalAmount,
          status: "pending",
          payment_status: "paid",
          payment_method: paymentMethod,
          time_slot: timeSlot,
        })
        .select()
        .single();
      if (error) throw error;

      const items = cart.map((c) => ({
        order_id: order.id,
        menu_item_id: c.menuItem.id,
        item_name: c.menuItem.name,
        quantity: c.quantity,
        price: c.menuItem.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;
      return order;
    },
    onSuccess: () => {
      clearCart();
      setShowPayment(false);
      setShowCart(false);
      toast.success("Order placed successfully!");
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = menuItems.filter((item) => {
    const matchCat = category === "all" || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filtered.filter((i) => i.category === cat.id);
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-bright" /> Order Food
          </h1>
          <p className="text-gray-500 text-sm mt-1">Browse the menu and add items to your cart</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-brand/30"
        >
          <ShoppingCart className="w-5 h-5" />
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              category === cat.id
                ? "bg-brand border-brand text-white"
                : "border-app-border text-gray-400 hover:border-brand/40 hover:text-white"
            }`}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No items found</div>
      ) : (
        <div className="space-y-8">
          {category === "all" ? (
            Object.entries(grouped).map(([cat, items]) => {
              const catInfo = CATEGORIES.find((c) => c.id === cat);
              return (
                <div key={cat}>
                  <h2 className="text-white font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <span>{catInfo?.emoji}</span> {catInfo?.label}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} cart={cart} onAdd={addToCart} onUpdate={updateQuantity} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} cart={cart} onAdd={addToCart} onUpdate={updateQuantity} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md flex flex-col bg-app-card border-l border-app-border">
            <div className="flex items-center justify-between p-6 border-b border-app-border">
              <h2 className="font-display font-bold text-xl text-white">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-gray-600 text-sm mt-1">Add items from the menu</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-app-border">
                  <label className="text-gray-400 text-sm mb-2 flex items-center gap-1 font-medium">
                    <Clock className="w-4 h-4" /> Pickup Slot
                  </label>
                  <div className="flex gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setTimeSlot(slot.id)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                          timeSlot === slot.id ? "border-brand bg-brand/10 text-white" : "border-app-border text-gray-500 hover:border-brand/40"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="glass-card-2 p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{item.menuItem.name}</p>
                        <p className="text-brand-bright text-sm font-bold">{formatCurrency(item.menuItem.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-app-border flex items-center justify-center text-white hover:bg-brand/30 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-app-border flex items-center justify-center text-white hover:bg-brand/30 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.menuItem.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors ml-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-app-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 font-medium">Total ({totalItems} items)</span>
                    <span className="font-display font-bold text-2xl text-brand-bright">{formatCurrency(totalAmount)}</span>
                  </div>
                  <button onClick={() => setShowPayment(true)} className="btn-primary w-full">
                    Proceed to Pay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={totalAmount}
          onSuccess={(method) => orderMutation.mutate(method)}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

function MenuCard({ item, cart, onAdd, onUpdate }: {
  item: MenuItem;
  cart: { menuItem: MenuItem; quantity: number }[];
  onAdd: (item: MenuItem) => void;
  onUpdate: (id: string, qty: number) => void;
}) {
  const cartItem = cart.find((c) => c.menuItem.id === item.id);
  const qty = cartItem?.quantity || 0;

  const categoryEmoji: Record<string, string> = {
    breakfast: "🌅", lunch: "☀️", snacks: "🍟", beverages: "☕"
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-3 hover:border-brand/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">{categoryEmoji[item.category] || "🍽️"}</span>
            <p className="text-white font-semibold text-sm leading-tight">{item.name}</p>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
        </div>
        <p className="text-brand-bright font-bold text-lg flex-shrink-0">{formatCurrency(item.price)}</p>
      </div>
      <div className="mt-auto">
        {qty === 0 ? (
          <button onClick={() => onAdd(item)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-brand/40 text-brand-bright text-sm font-semibold hover:bg-brand/10 transition-colors">
            <Plus className="w-4 h-4" /> Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-brand/10 border border-brand/30 rounded-xl px-3 py-2">
            <button onClick={() => onUpdate(item.id, qty - 1)} className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center text-brand-bright hover:bg-brand/40 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-white font-bold">{qty}</span>
            <button onClick={() => onUpdate(item.id, qty + 1)} className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center text-brand-bright hover:bg-brand/40 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
