import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import Alert from "../components/Alert";
import { api } from "../api";

export default function Register({ onRegistered, goLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [show, setShow] = useState(false);
  const [state, setState] = useState({ loading: false, error: "" });

  const update = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setState({ loading: false, error: "" });
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setState({ loading: false, error: "Passwords do not match." });
      return;
    }

    setState({ loading: true, error: "" });

    try {
      await api.register(form);
      onRegistered(form.email);
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register first. We'll verify your email before activation."
    >
      <form onSubmit={submit} className="auth-form">
        {state.error && <Alert>{state.error}</Alert>}

        <Field
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={update}
          placeholder="Pragya Mishra"
          autoComplete="name"
        />

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
            type={show ? "text" : "password"}
            value={form.password}
            onChange={update}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Field
          label="Confirm password"
          name="confirmPassword"
          type={show ? "text" : "password"}
          value={form.confirmPassword}
          onChange={update}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        <div className="password-hint">
          Use 8–72 characters. Never reuse an important password.
        </div>

        <button className="primary-button" disabled={state.loading}>
          {state.loading ? "Creating account..." : "Create account"}
          {!state.loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="switch-text">
        Already have an account?
        <button onClick={goLogin}>Sign in</button>
      </div>
    </AuthLayout>
  );
}
