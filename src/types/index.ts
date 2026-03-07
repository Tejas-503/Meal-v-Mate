export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isStaff: boolean;
}

export interface SeatBooking {
  id: string;
  seat_number: number;
  user_id: string;
  student_name: string;
  student_email: string;
  time_slot: "breakfast" | "lunch" | "evening";
  booking_date: string;
  status: "confirmed" | "cancelled";
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "snacks" | "beverages";
  price: number;
  description: string;
  available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  total_amount: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  payment_status: "pending" | "paid";
  payment_method: string;
  time_slot: string;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type TimeSlot = "breakfast" | "lunch" | "evening";
