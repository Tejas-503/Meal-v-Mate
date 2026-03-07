import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import SeatMap from "@/components/features/SeatMap";
import { toast } from "sonner";
import { Armchair, X, RefreshCw, Users, Calendar } from "lucide-react";
import { todayDate } from "@/lib/utils";
import type { SeatBooking, TimeSlot } from "@/types";

const TIME_SLOTS: { id: TimeSlot; label: string; time: string; emoji: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "9:00 AM – 12:00 PM", emoji: "🌅" },
  { id: "lunch", label: "Lunch", time: "1:00 PM – 3:00 PM", emoji: "☀️" },
  { id: "evening", label: "Evening Snacks", time: "4:00 PM – 5:30 PM", emoji: "🌆" },
];

export default function ManageSeats() {
  const qc = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>("breakfast");
  const [selectedDate, setSelectedDate] = useState(todayDate());

  const { data: bookings = [], isLoading, refetch } = useQuery<SeatBooking[]>({
    queryKey: ["staff-bookings", selectedSlot, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .eq("time_slot", selectedSlot)
        .eq("booking_date", selectedDate)
        .eq("status", "confirmed")
        .order("seat_number");
      return data || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("seat_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["staff-bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const booked = bookings.length;
  const available = 30 - booked;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Armchair className="w-6 h-6 text-brand-bright" /> Manage Seats
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all seat bookings</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-gray-400 hover:text-white border border-app-border hover:border-brand/40 px-3 py-2 rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <label className="text-gray-400 text-sm mb-2 flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4" /> Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-dark"
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-gray-400 text-sm mb-3 font-medium block">Time Slot</label>
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedSlot === slot.id ? "border-brand bg-brand/10" : "border-app-border hover:border-brand/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{slot.emoji}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{slot.label}</p>
                      <p className="text-gray-500 text-xs">{slot.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 text-center border border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-bold text-3xl">{booked}</p>
              <p className="text-gray-500 text-xs mt-1">Booked</p>
            </div>
            <div className="glass-card p-4 text-center border border-green-500/20 bg-green-500/5">
              <p className="text-green-400 font-bold text-3xl">{available}</p>
              <p className="text-gray-500 text-xs mt-1">Available</p>
            </div>
          </div>

          {/* Bookings List */}
          <div className="glass-card p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Confirmed Bookings ({booked})
            </h3>
            {bookings.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">No bookings for this slot</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-app-card-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand-bright font-bold text-sm">
                        {b.seat_number}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold truncate max-w-[100px]">{b.student_name}</p>
                        <p className="text-gray-600 text-xs truncate max-w-[100px]">{b.student_email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelMutation.mutate(b.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors flex-shrink-0"
                      title="Cancel booking"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seat Map */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-white font-semibold mb-6">Seat Layout — {TIME_SLOTS.find((s) => s.id === selectedSlot)?.label}</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : (
            <SeatMap
              bookings={bookings}
              isStaff={true}
              readOnly={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
