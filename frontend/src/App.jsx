import { useEffect, useState } from "react";
import { api } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={() => setUser(null)}
      />
    );
  }

  if (screen === "register") {
    return (
      <Register
        onRegistered={(email) => {
          setPendingEmail(email);
          setScreen("otp");
        }}
        goLogin={() => setScreen("login")}
      />
    );
  }

  if (screen === "otp") {
    return (
      <Otp
        email={pendingEmail}
        onVerified={() => setScreen("login")}
        goRegister={() => setScreen("register")}
      />
    );
  }

  return (
    <Login
      onLogin={(loggedInUser) => setUser(loggedInUser)}
      goRegister={() => setScreen("register")}
    />
  );
}
