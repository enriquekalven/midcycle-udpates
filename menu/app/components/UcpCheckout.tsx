"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Lock, X, CheckCircle } from "lucide-react";
import { useState } from "react";

interface UcpCheckoutProps {
  data: {
    item_id: string;
    item_name: string;
    price: string;
    quantity: number;
    transaction_id: string;
    merchant_id: string;
  };
  onClose: () => void;
}

export function UcpCheckout({ data, onClose }: UcpCheckoutProps) {
  const [step, setStep] = useState<"review" | "processing" | "success">("review");

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gold/30 shadow-2xl overflow-hidden flex flex-col w-full max-w-[320px] mx-auto"
    >
      {/* UCP Secure Header */}
      <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <span className="text-xs font-outfit uppercase tracking-widest font-bold">UCP Secure Checkout</span>
        </div>
        <button onClick={onClose} className="opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-6">
        {step === "review" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-playfair text-lg text-ocean">{data.item_name}</h4>
                <p className="text-xs text-ocean/60 font-outfit">QTY: {data.quantity}</p>
              </div>
              <span className="font-outfit font-bold text-gold">{data.price}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-ocean/40 uppercase font-bold tracking-tighter">
                <Lock className="w-3 h-3" /> Encrypted Payload v1.0
              </div>
              <p className="text-[10px] font-mono text-ocean/60 break-all">
                TXN: {data.transaction_id}
              </p>
            </div>

            <button 
              onClick={handlePay}
              className="w-full py-4 bg-ocean text-white rounded-xl font-outfit font-bold flex items-center justify-center gap-2 hover:bg-gold transition-all shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              Pay Secured (GPay)
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="py-10 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gold/10 border-t-gold rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gold animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="font-playfair text-xl text-ocean">Processing Payment</h4>
              <p className="text-sm text-ocean/60 font-outfit mt-2">Authenticating with UCP Gateway...</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-10 flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h4 className="font-playfair text-2xl text-ocean">Payment Complete!</h4>
              <p className="text-sm text-ocean/60 font-outfit mt-2">Your sourdough delight is on the way.</p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-2 border border-ocean text-ocean rounded-full font-outfit text-sm hover:bg-ocean hover:text-white transition-all"
            >
              Back to Menu
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[9px] text-ocean/30 uppercase tracking-[0.2em] font-bold">
          Powered by A2UI & Universal Commerce Protocol
        </p>
      </div>
    </motion.div>
  );
}
