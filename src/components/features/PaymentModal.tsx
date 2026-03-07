import { useState } from "react";
import { X, CreditCard, Smartphone, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  total: number;
  onSuccess: (method: string) => void;
  onClose: () => void;
}

const paymentMethods = [
  { id: "upi", label: "UPI / QR Code", icon: Smartphone, desc: "Pay via UPI ID or scan QR" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "cash", label: "Cash at Counter", icon: Banknote, desc: "Pay when you collect" },
];

export default function PaymentModal({ total, onSuccess, onClose }: PaymentModalProps) {
  const [selected, setSelected] = useState("upi");
  const [step, setStep] = useState<"select" | "processing" | "success">("select");

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => onSuccess(selected), 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step === "select" ? onClose : undefined} />
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
        {step === "select" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">Complete Payment</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-app-card-2 rounded-xl p-4 mb-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Amount</p>
              <p className="font-display font-black text-4xl text-brand-bright">{formatCurrency(total)}</p>
            </div>

            <p className="text-gray-400 text-sm mb-3 font-medium">Choose Payment Method</p>
            <div className="space-y-2 mb-6">
              {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selected === id
                      ? "border-brand bg-brand/10"
                      : "border-app-border hover:border-brand/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === id ? "bg-brand text-white" : "bg-app-card-2 text-gray-400"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected === id ? "border-brand bg-brand" : "border-gray-600"}`} />
                </button>
              ))}
            </div>

            <button onClick={handlePay} className="btn-primary w-full">
              Pay {formatCurrency(total)}
            </button>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-brand/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Processing Payment</h3>
            <p className="text-gray-400 text-sm">Please wait while we confirm your payment...</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-400 text-sm">Your order has been placed. Enjoy your meal!</p>
          </div>
        )}
      </div>
    </div>
  );
}
