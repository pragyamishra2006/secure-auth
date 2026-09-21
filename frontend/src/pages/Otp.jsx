import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import Alert from "../components/Alert";
import { api } from "../api";

export default function Otp({ email, onVerified, goRegister }) {
  const [otp, setOtp] = useState("");
  const [state, setState] = useState({ loading: false, error: "", success: "" });
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const submit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setState({ loading: false, error: "Enter the 6-digit code from your email.", success: "" });
      return;
    }

    setState({ loading: true, error: "", success: "" });

    try {
      const data = await api.verifyOtp({ email, otp });
      setState({ loading: false, error: "", success: data.message });
      setTimeout(onVerified, 900);
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  };

  const resend = async () => {
    if (seconds > 0) return;

    setState({ loading: true, error: "", success: "" });

    try {
      const data = await api.resendOtp(email);
      setState({ loading: false, error: "", success: data.message });
      setSeconds(60);
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="We've sent a 6-digit verification code to your email."
    >
      <div className="otp-address">{email}</div>

      <form onSubmit={submit} className="auth-form">
        {state.error && <Alert>{state.error}</Alert>}
        {state.success && <Alert type="success">{state.success}</Alert>}

        <div className="otp-field">
          <label htmlFor="otp">Verification code</label>
          <input
            id="otp"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="otp-input"
          />
          <span>Code expires after 10 minutes.</span>
        </div>

        <button className="primary-button" disabled={state.loading || otp.length !== 6}>
          {state.loading ? "Verifying..." : "Verify email"}
          {!state.loading && <CheckCircle2 size={18} />}
        </button>
      </form>

      <button className="resend-button" onClick={resend} disabled={seconds > 0 || state.loading}>
        <RefreshCw size={16} />
        {seconds > 0 ? `Resend available in ${seconds}s` : "Resend OTP"}
      </button>

      <button className="back-button" onClick={goRegister}>
        <ArrowLeft size={16} />
        Use a different email
      </button>
    </AuthLayout>
  );
}
