import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import Alert from "../components/Alert";
import { api } from "../api";

export default function Login({ onLogin, goRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({ loading: false, error: "" });

  const update = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setState({ loading: false, error: "" });
  };

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "" });

    try {
      const data = await api.login(form);
      onLogin(data.user);
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account."
    >
      <form onSubmit={submit} className="auth-form">
        {state.error && <Alert>{state.error}</Alert>}

        <Field
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="password-wrap">
          <Field
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={update}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="primary-button" disabled={state.loading}>
          {state.loading ? "Signing in..." : "Sign in"}
          {!state.loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="switch-text">
        Don't have an account?
        <button onClick={goRegister}>Create one</button>
      </div>
    </AuthLayout>
  );
}
