import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTimeSlotLabel(slot: string): string {
  const labels: Record<string, string> = {
    breakfast: "Breakfast (9:00 AM – 12:00 PM)",
    lunch: "Lunch (1:00 PM – 3:00 PM)",
    evening: "Evening Snacks (4:00 PM – 5:30 PM)",
  };
  return labels[slot] || slot;
}

export function getTimeSlotShort(slot: string): string {
  const labels: Record<string, string> = {
    breakfast: "9 AM – 12 PM",
    lunch: "1 PM – 3 PM",
    evening: "4 PM – 5:30 PM",
  };
  return labels[slot] || slot;
}

export function canCancelOrder(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - created;
  return diffMs < 5 * 60 * 1000; // 5 minutes
}

export function getCancelCountdown(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const remaining = 5 * 60 * 1000 - (now - created);
  if (remaining <= 0) return "0:00";
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}
