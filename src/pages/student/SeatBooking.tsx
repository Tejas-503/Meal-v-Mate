import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import SeatMap from "@/components/features/SeatMap";
import { toast } from "sonner";
import { Armchair, Calendar, Clock, CheckCircle, X, Info } from "lucide-react";
import { todayDate, getTimeSlotLabel } from "@/lib/utils";
import type { SeatBooking, TimeSlot } from "@/types";

const TIME_SLOTS: { id: TimeSlot; label: string; time: string; emoji: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "9:00 AM – 12:00 PM", emoji: "🌅" },
  { id: "lunch", label: "Lunch", time: "1:00 PM – 3:00 PM", emoji: "☀️" },
  { id: "evening", label: "Evening Snacks", time: "4:00 PM – 5:30 PM", emoji: "🌆" },
];

export default function SeatBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>("breakfast");
  const [selectedDate, setSelectedDate] = useState(todayDate());
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const { data: bookings = [], isLoading } = useQuery<SeatBooking[]>({
    queryKey: ["bookings", selectedSlot, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .eq("time_slot", selectedSlot)
        .eq("booking_date", selectedDate)
        .eq("status", "confirmed");
      return data || [];
    },
  });

  const { data: myBookings = [] } = useQuery<SeatBooking[]>({
    queryKey: ["my-bookings-all", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("seat_bookings")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "confirmed")
        .gte("booking_date", todayDate());
      return data || [];
    },
    enabled: !!user?.id,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSeat) return;
      const { error } = await supabase.from("seat_bookings").insert({
        seat_number: selectedSeat,
        user_id: user!.id,
        student_name: user!.username,
        student_email: user!.email,
        time_slot: selectedSlot,
        booking_date: selectedDate,
        status: "confirmed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Seat ${selectedSeat} booked for ${selectedSlot}!`);
      setSelectedSeat(null);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["my-bookings-all"] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
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
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["my-bookings-all"] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const availableSeats = 30 - bookings.length;
  const alreadyBooked = myBookings.find(
    (b) => b.time_slot === selectedSlot && b.booking_date === selectedDate
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Armchair className="w-6 h-6 text-brand-bright" /> Seat Booking
        </h1>
        <p className="text-gray-500 text-sm mt-1">Reserve your seat before break time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Date Picker */}
          <div className="glass-card p-4">
            <label className="text-gray-400 text-sm mb-2 flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4" /> Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={todayDate()}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSeat(null); }}
              className="input-dark"
            />
          </div>

          {/* Time Slot */}
          <div className="glass-card p-4">
            <label className="text-gray-400 text-sm mb-3 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4" /> Time Slot
            </label>
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => { setSelectedSlot(slot.id); setSelectedSeat(null); }}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedSlot === slot.id
                      ? "border-brand bg-brand/10"
                      : "border-app-border hover:border-brand/40"
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

          {/* Availability */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-medium">Seat Availability</span>
            </div>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 bg-brand/20 rounded-full h-2">
                <div
                  className="bg-brand rounded-full h-2 transition-all"
                  style={{ width: `${(availableSeats / 30) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-brand-bright font-bold text-2xl">{availableSeats}<span className="text-gray-500 font-normal text-sm">/30 available</span></p>
          </div>

          {/* My Bookings */}
          {myBookings.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-gray-400 text-sm font-medium mb-3">My Upcoming Bookings</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {myBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-app-card-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand-bright font-bold text-sm">{b.seat_number}</div>
                      <div>
                        <p className="text-white text-xs font-semibold capitalize">{b.time_slot}</p>
                        <p className="text-gray-500 text-xs">{b.booking_date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelMutation.mutate(b.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                      title="Cancel booking"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Seat Map */}
        <div className="lg:col-span-2 glass-card p-6">
          {alreadyBooked ? (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">
                You already have <strong>Seat {alreadyBooked.seat_number}</strong> booked for this slot.
              </p>
            </div>
          ) : selectedSeat ? (
            <div className="flex items-center justify-between bg-brand/10 border border-brand/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-brand-bright" />
                <p className="text-white text-sm">
                  Selected: <strong>Seat {selectedSeat}</strong> · {TIME_SLOTS.find((s) => s.id === selectedSlot)?.label}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedSeat(null)} className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-app-border text-sm transition-colors">
                  Clear
                </button>
                <button
                  onClick={() => bookMutation.mutate()}
                  disabled={bookMutation.isPending}
                  className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50"
                >
                  {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-app-card-2 border border-app-border rounded-xl p-3 mb-6">
              <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <p className="text-gray-500 text-sm">Click on an available seat to book it</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : (
            <SeatMap
              bookings={bookings}
              selectedSeat={selectedSeat}
              onSeatSelect={(num) => {
                if (!alreadyBooked) setSelectedSeat(num);
              }}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
