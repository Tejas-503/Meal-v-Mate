import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UtensilsCrossed, Mail, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const STAFF_EMAIL = "staff@mealmate.com";
const STAFF_PASSWORD = "Staff@2024";

export default function StaffAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === STAFF_EMAIL && password === STAFF_PASSWORD) {
        login({
          id: "staff-001",
          email: STAFF_EMAIL,
          username: "Canteen Staff",
          isStaff: true,
        });
        toast.success("Welcome, Staff!");
        navigate("/staff/dashboard");
      } else {
        toast.error("Invalid staff credentials");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="blob w-96 h-96 bg-gray-700 -top-20 -left-20 opacity-10" />
      <div className="blob w-64 h-64 bg-blue-900 bottom-10 -right-10 opacity-10" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-700/50 border border-gray-600/30 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">Meal<span className="text-brand-bright">Mate</span></h1>
              <p className="text-gray-500 text-xs">Staff Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">Staff-only access. Use your canteen credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-white mb-6">Staff Login</h2>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Staff Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@mealmate.com"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In as Staff"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-app-card-2 rounded-xl border border-app-border">
            <p className="text-gray-500 text-xs mb-1 font-medium">Demo Credentials</p>
            <p className="text-gray-400 text-xs">Email: <span className="text-brand-bright">staff@mealmate.com</span></p>
            <p className="text-gray-400 text-xs">Password: <span className="text-brand-bright">Staff@2024</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
