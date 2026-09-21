import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function Alert({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : type === "info" ? Info : AlertCircle;

  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}
