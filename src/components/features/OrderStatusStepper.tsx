import { CheckCircle, Clock, ChefHat, Bell, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Bell },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface OrderStatusStepperProps {
  status: string;
}

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                isCompleted && "border-green-500 bg-green-500/20",
                isCurrent && "border-brand bg-brand/20 animate-pulse",
                !isCompleted && !isCurrent && "border-app-border bg-app-card"
              )}>
                <Icon className={cn(
                  "w-3.5 h-3.5",
                  isCompleted && "text-green-400",
                  isCurrent && "text-brand-bright",
                  !isCompleted && !isCurrent && "text-gray-600"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium whitespace-nowrap",
                isCompleted && "text-green-400",
                isCurrent && "text-brand-bright",
                !isCompleted && !isCurrent && "text-gray-600"
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-0.5 w-8 mx-1 mb-4 transition-colors",
                idx < currentIndex ? "bg-green-500" : "bg-app-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
