import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UtensilsCrossed, Mail, Lock, User, ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { AuthUser } from "@/types";

type Tab = "login" | "register";
type RegisterStep = "email" | "otp" | "password";

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.email!.split("@")[0],
    isStaff: false,
  };
}

export default function StudentAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regStep, setRegStep] = useState<RegisterStep>("email");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    login(mapUser(data.user));
    toast.success("Welcome back!");
    navigate("/student/dashboard");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: regEmail,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("OTP sent to your email!");
    setRegStep("otp");
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: regEmail,
      token: regOtp,
      type: "email",
    });
    if (error) {
      toast.error("Invalid OTP. Please try again.");
      setLoading(false);
      return;
    }
    toast.success("OTP verified!");
    setRegStep("password");
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password: regPassword,
      data: { username: regName },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    login(mapUser(data.user));
    toast.success(`Welcome to FoodHub, ${regName}!`);
    navigate("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="blob w-96 h-96 bg-blue-700 -top-20 -right-20 opacity-10" />
      <div className="blob w-64 h-64 bg-blue-900 bottom-10 -left-10 opacity-10" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">FoodHub</h1>
              <p className="text-gray-500 text-xs">Student Portal</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-app-card-2 rounded-xl p-1 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setRegStep("email"); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                  tab === t
                    ? "bg-brand text-white shadow-lg shadow-brand/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="font-display font-bold text-2xl text-white mb-6">Welcome Back</h2>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-dark pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Create Account</h2>
              <p className="text-gray-500 text-sm mb-6">
                Step {regStep === "email" ? "1" : regStep === "otp" ? "2" : "3"} of 3
              </p>

              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {["email", "otp", "password"].map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                    ["email", "otp", "password"].indexOf(regStep) >= i ? "bg-brand" : "bg-app-border"
                  }`} />
                ))}
              </div>

              {regStep === "email" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name" className="input-dark pl-10" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="student@college.edu" className="input-dark pl-10" required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {regStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-gray-400 text-sm">Enter the 4-digit OTP sent to <span className="text-brand-bright">{regEmail}</span></p>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">OTP Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={regOtp} onChange={(e) => setRegOtp(e.target.value)} placeholder="Enter 4-digit OTP" className="input-dark pl-10 text-center tracking-[0.5em] text-xl" maxLength={4} required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button type="button" onClick={() => setRegStep("email")} className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    ← Change Email
                  </button>
                </form>
              )}

              {regStep === "password" && (
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <p className="text-gray-400 text-sm">Set a password for your account.</p>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type={showPass ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 characters" className="input-dark pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
