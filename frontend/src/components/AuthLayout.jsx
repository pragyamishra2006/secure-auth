import { LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import Brand from "./Brand";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="visual-content">
          <Brand />
          <div className="visual-copy">
            <div className="eyebrow">SECURE BY DESIGN</div>
            <h1>Your account.<br />Protected properly.</h1>
            <p>
              A clean authentication experience with email verification,
              secure sessions, and privacy-first account handling.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon"><MailCheck size={18} /></div>
              <div>
                <strong>Email verification</strong>
                <span>Activate your account only after OTP verification.</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><LockKeyhole size={18} /></div>
              <div>
                <strong>Secure credentials</strong>
                <span>Passwords are hashed and sessions use protected cookies.</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <strong>Abuse protection</strong>
                <span>Rate limits help protect login and OTP endpoints.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><Brand /></div>
          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
