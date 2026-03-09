import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Landing from "@/pages/Landing";
import StudentAuth from "@/pages/StudentAuth";
import StaffAuth from "@/pages/StaffAuth";
import StudentLayout from "@/components/layout/StudentLayout";
import StaffLayout from "@/components/layout/StaffLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import SeatBooking from "@/pages/student/SeatBooking";
import Menu from "@/pages/student/Menu";
import MyOrders from "@/pages/student/MyOrders";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import ManageSeats from "@/pages/staff/ManageSeats";
import ManageMenu from "@/pages/staff/ManageMenu";
import ManageOrders from "@/pages/staff/ManageOrders";
import Analytics from "@/pages/staff/Analytics";

function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/student/auth" replace />;
  if (user.isStaff) return <Navigate to="/staff/dashboard" replace />;
  return <>{children}</>;
}

function StaffGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/staff/auth" replace />;
  if (!user.isStaff) return <Navigate to="/student/dashboard" replace />;
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    return user.isStaff
      ? <Navigate to="/staff/dashboard" replace />
      : <Navigate to="/student/dashboard" replace />;
  }
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Loading MealMate...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/student/auth"
        element={
          <AuthGuard>
            <StudentAuth />
          </AuthGuard>
        }
      />
      <Route
        path="/staff/auth"
        element={
          <AuthGuard>
            <StaffAuth />
          </AuthGuard>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <StudentGuard>
            <StudentLayout />
          </StudentGuard>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="seats" element={<SeatBooking />} />
        <Route path="menu" element={<Menu />} />
        <Route path="orders" element={<MyOrders />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <StaffGuard>
            <StaffLayout />
          </StaffGuard>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="seats" element={<ManageSeats />} />
        <Route path="menu" element={<ManageMenu />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
