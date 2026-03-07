import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  ChefHat, Plus, Pencil, Trash2, X, Check,
  ToggleLeft, ToggleRight, Search
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "breakfast", label: "Breakfast", emoji: "🌅" },
  { id: "lunch", label: "Lunch", emoji: "☀️" },
  { id: "snacks", label: "Snacks", emoji: "🍟" },
  { id: "beverages", label: "Beverages", emoji: "☕" },
];

interface ItemForm {
  name: string;
  category: string;
  price: string;
  description: string;
  available: boolean;
}

const defaultForm: ItemForm = {
  name: "",
  category: "breakfast",
  price: "",
  description: "",
  available: true,
};

export default function ManageMenu() {
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<ItemForm>(defaultForm);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["staff-menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        description: form.description.trim(),
        available: form.available,
      };
      if (editItem) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editItem ? "Item updated!" : "Item added!");
      setShowModal(false);
      setEditItem(null);
      setForm(defaultForm);
      qc.invalidateQueries({ queryKey: ["staff-menu"] });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const { error } = await supabase.from("menu_items").update({ available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-menu"] });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item removed");
      qc.invalidateQueries({ queryKey: ["staff-menu"] });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price.toString(), description: item.description, available: item.available });
    setShowModal(true);
  };

  const filtered = menuItems.filter((item) => {
    const matchCat = category === "all" || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catEmoji: Record<string, string> = { breakfast: "🌅", lunch: "☀️", snacks: "🍟", beverages: "☕" };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-brand-bright" /> Manage Menu
          </h1>
          <p className="text-gray-500 text-sm mt-1">{menuItems.length} items · {menuItems.filter((i) => i.available).length} available</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map((cat) => {
          const count = cat.id === "all" ? menuItems.length : menuItems.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm whitespace-nowrap transition-all ${
                category === cat.id ? "bg-brand border-brand text-white" : "border-app-border text-gray-400 hover:border-brand/40"
              }`}
            >
              {cat.emoji} {cat.label} <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-app-border">
            {filtered.map((item) => (
              <div key={item.id} className={`flex items-center justify-between px-4 py-3 hover:bg-app-card-2 transition-colors ${!item.available ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{catEmoji[item.category] || "🍽️"}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.description}</p>
                    <span className={`text-xs capitalize ${item.available ? "text-green-400" : "text-gray-600"}`}>
                      {item.available ? "● Available" : "○ Unavailable"} · {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-brand-bright font-bold">{formatCurrency(item.price)}</span>
                  <button
                    onClick={() => toggleMutation.mutate({ id: item.id, available: !item.available })}
                    className={`p-1.5 rounded-lg transition-colors ${item.available ? "text-green-400 hover:bg-green-500/10" : "text-gray-500 hover:bg-gray-500/10"}`}
                    title={item.available ? "Mark Unavailable" : "Mark Available"}
                  >
                    {item.available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-app-border transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-500">No items found</div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">{editItem ? "Edit Item" : "Add Menu Item"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Item Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Masala Dosa" className="input-dark" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" min="0" step="0.5" className="input-dark" required />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the item" className="input-dark resize-none" rows={2} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-app-card-2 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, available: !form.available })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.available ? "bg-brand" : "bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-gray-300 text-sm">{form.available ? "Available for ordering" : "Not available"}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.name || !form.price}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saveMutation.isPending ? "Saving..." : editItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
