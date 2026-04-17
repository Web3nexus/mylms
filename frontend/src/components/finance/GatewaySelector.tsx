import { CreditCard, Globe, Zap } from "lucide-react";

interface GatewaySelectorProps {
  selected: string;
  onSelect: (gateway: string) => void;
}

const gateways = [
  { 
    id: "stripe", 
    name: "Stripe", 
    description: "International Credit & Debit Cards", 
    icon: <Globe className="text-blue-500" /> 
  },
  { 
    id: "paystack", 
    name: "Paystack", 
    description: "Local Nigerian Accounts & Cards", 
    icon: <CreditCard className="text-green-500" /> 
  },
  { 
    id: "flutterwave", 
    name: "Flutterwave", 
    description: "Multi-currency & Mobile Money", 
    icon: <Zap className="text-orange-500" /> 
  }
];

export default function GatewaySelector({ selected, onSelect }: GatewaySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {gateways.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onSelect(g.id)}
          className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all group ${
            selected === g.id
              ? "border-mylms-purple bg-mylms-purple/5 shadow-xl scale-105"
              : "border-border-soft bg-white hover:border-mylms-purple/30 shadow-sm"
          }`}
        >
          <div className={`p-4 rounded-xl mb-6 transition-colors shadow-sm ${
            selected === g.id ? "bg-mylms-purple text-white" : "bg-offwhite text-gray-400 group-hover:text-mylms-purple"
          }`}>
            {g.icon}
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-2">
            {g.name}
          </h3>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center opacity-60">
            {g.description}
          </p>
        </button>
      ))}
    </div>
  );
}
