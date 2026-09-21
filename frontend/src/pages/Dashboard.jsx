import { useState } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import Brand from "../components/Brand";
import Alert from "../components/Alert";
import { api } from "../api";

export default function Dashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = async () => {
    setLoading(true);
    setError("");

    try {
      await api.logout();
      onLogout();
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Brand />
        <button className="logout-button" onClick={logout} disabled={loading}>
          <LogOut size={17} />
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </header>

      <section className="dashboard-main">
        <div className="dashboard-badge">
          <ShieldCheck size={18} />
          Authenticated session
        </div>

        <h1>Welcome, {user.fullName.split(" ")[0]}.</h1>
        <p className="dashboard-lead">
          Your account is active and your email address has been successfully verified.
        </p>

        {error && <Alert>{error}</Alert>}

        <div className="profile-card">
          <div className="profile-avatar">
            <UserRound size={25} />
          </div>
          <div className="profile-info">
            <span>Full name</span>
            <strong>{user.fullName}</strong>
          </div>
          <div className="profile-info">
            <span>Email address</span>
            <strong>{user.email}</strong>
          </div>
          <div className="verified-pill">
            <ShieldCheck size={15} />
            Verified
          </div>
        </div>

        <div className="security-note">
          <ShieldCheck size={19} />
          <div>
            <strong>Protected session</strong>
            <p>Your authentication token is kept in an HttpOnly cookie and is not exposed to frontend JavaScript.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
