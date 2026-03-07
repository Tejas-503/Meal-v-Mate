import { cn } from "@/lib/utils";
import type { SeatBooking } from "@/types";
import { ChefHat, User } from "lucide-react";

interface SeatMapProps {
  bookings: SeatBooking[];
  selectedSeat?: number | null;
  onSeatSelect?: (seat: number) => void;
  currentUserId?: string;
  isStaff?: boolean;
  readOnly?: boolean;
}

export default function SeatMap({
  bookings,
  selectedSeat,
  onSeatSelect,
  currentUserId,
  isStaff = false,
  readOnly = false,
}: SeatMapProps) {
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const getBooking = (seatNum: number) =>
    confirmedBookings.find((b) => b.seat_number === seatNum);

  const isMyBooking = (seatNum: number) => {
    const b = getBooking(seatNum);
    return b && b.user_id === currentUserId;
  };

  const isBooked = (seatNum: number) => !!getBooking(seatNum);

  const getSeatState = (seatNum: number) => {
    if (isMyBooking(seatNum)) return "mine";
    if (isBooked(seatNum)) return "taken";
    if (selectedSeat === seatNum) return "selected";
    return "available";
  };

  const rows = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30],
  ];

  return (
    <div className="w-full">
      {/* Counter */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-brand/30 via-brand/40 to-brand/30 border border-brand/40 rounded-2xl p-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent" />
          <div className="relative z-10 flex items-center justify-center gap-3">
            <ChefHat className="w-6 h-6 text-brand-bright" />
            <div>
              <p className="text-brand-bright font-bold font-display text-lg">🍽️ Canteen Counter</p>
              <p className="text-blue-300/60 text-xs">Serving Window · Collection Point</p>
            </div>
            <ChefHat className="w-6 h-6 text-brand-bright" />
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="w-0.5 h-6 bg-app-border" />
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-4">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-3">
            {row.map((seatNum) => {
              const state = getSeatState(seatNum);
              const booking = getBooking(seatNum);
              const canClick = !readOnly && state !== "taken";

              return (
                <button
                  key={seatNum}
                  disabled={!canClick}
                  onClick={() => canClick && onSeatSelect?.(seatNum)}
                  title={
                    booking
                      ? isStaff
                        ? `${booking.student_name} (${booking.student_email})`
                        : isMyBooking(seatNum)
                        ? "Your seat"
                        : "Booked"
                      : `Seat ${seatNum}`
                  }
                  className={cn(
                    "relative w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex items-center justify-center",
                    state === "available" &&
                      "border-app-border bg-app-card text-gray-400 hover:border-brand hover:text-brand-bright hover:bg-brand/10 hover:scale-105 cursor-pointer",
                    state === "selected" &&
                      "border-brand bg-brand text-white shadow-lg shadow-brand/40 scale-105",
                    state === "mine" &&
                      "border-green-500/60 bg-green-500/20 text-green-400 cursor-default",
                    state === "taken" &&
                      "border-red-500/30 bg-red-500/10 text-red-400/60 cursor-not-allowed"
                  )}
                >
                  {state === "mine" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    seatNum
                  )}
                  {isStaff && booking && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-app-bg" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        {[
          { color: "bg-app-card border-app-border text-gray-400", label: "Available" },
          { color: "bg-brand border-brand text-white", label: "Selected" },
          { color: "bg-green-500/20 border-green-500/60 text-green-400", label: "My Booking" },
          { color: "bg-red-500/10 border-red-500/30 text-red-400/60", label: "Taken" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg border-2 ${color}`} />
            <span className="text-gray-500 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
