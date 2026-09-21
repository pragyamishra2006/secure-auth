import { ShieldCheck } from "lucide-react";

export default function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <ShieldCheck size={22} strokeWidth={2.5} />
      </div>
      <div>
        <div className="brand-name">SecureAuth</div>
        <div className="brand-subtitle">Identity made simple</div>
      </div>
    </div>
  );
}
