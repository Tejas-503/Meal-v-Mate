import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, GraduationCap, ShieldCheck, ChevronRight, Star } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-bg overflow-hidden relative flex flex-col">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-[500px] h-[500px] bg-blue-600 -top-40 -left-40 animate-float" />
        <div className="blob w-[400px] h-[400px] bg-blue-800 top-1/2 -right-32 animate-float" style={{ animationDelay: "3s" }} />
        <div className="blob w-[300px] h-[300px] bg-blue-500 bottom-20 left-1/3 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-app-bg/20 via-transparent to-app-bg" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center blue-glow">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Meal<span className="text-brand-bright">Mate</span>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Canteen Open</span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-2 mb-8">
          <Star className="w-4 h-4 text-brand-bright fill-brand-bright" />
          <span className="text-brand-bright text-sm font-medium">Smart Canteen Management System</span>
        </div>

        <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl text-white leading-none mb-6 tracking-tight">
          Meal
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand-bright">Mate</span>
        </h1>
        <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-4 leading-relaxed">
          Book seats. Order food. Track everything — all in one place.
        </p>
        <p className="text-gray-600 text-base mb-16 max-w-md">
          Your college canteen, reimagined with real-time ordering, seat reservations, and instant tracking.
        </p>

        {/* Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Student Card */}
          <button
            onClick={() => navigate("/student/auth")}
            className="group relative glass-card p-8 text-left hover:border-brand/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-brand/20 border border-brand/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand/30 transition-colors duration-300">
                <GraduationCap className="w-7 h-7 text-brand-bright" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Student Portal</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Book seats, browse the menu, place orders, track your food, and manage bookings.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Seat Booking", "Order Food", "Track Orders"].map((tag) => (
                  <span key={tag} className="badge-info text-xs">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-brand-bright font-semibold text-sm">
                Login / Register
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </button>

          {/* Staff Card */}
          <button
            onClick={() => navigate("/staff/auth")}
            className="group relative glass-card p-8 text-left border-gray-600/30 hover:border-brand/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gray-700/30 border border-gray-600/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-700/50 transition-colors duration-300">
                <ShieldCheck className="w-7 h-7 text-gray-300" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Staff Portal</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Manage orders, update menus, handle seat bookings, and view analytics & revenue.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Manage Menu", "Revenue", "Analytics"].map((tag) => (
                  <span key={tag} className="badge-gray text-xs">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gray-300 font-semibold text-sm">
                Staff Login
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </button>
        </div>

        {/* Time Slots */}
        <div className="mt-16 w-full max-w-2xl">
          <p className="text-gray-600 text-sm mb-4">Today's Service Hours</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Breakfast", time: "9:00 AM – 12:00 PM", icon: "🌅" },
              { label: "Lunch", time: "1:00 PM – 3:00 PM", icon: "☀️" },
              { label: "Evening", time: "4:00 PM – 5:30 PM", icon: "🌆" },
            ].map((slot) => (
              <div key={slot.label} className="glass-card p-4 text-center">
                <div className="text-2xl mb-1">{slot.icon}</div>
                <div className="text-white font-semibold text-sm">{slot.label}</div>
                <div className="text-gray-500 text-xs mt-1">{slot.time}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-gray-600 text-sm">
        © 2025 MealMate · Smart Canteen Management
      </footer>
    </div>
  );
}
