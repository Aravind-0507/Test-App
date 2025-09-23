import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const apiBase = "http://127.0.0.1:8000/api";

  const inputStyle = {
    padding: "0.75rem 1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  };

  const buttonStyle = {
    ...inputStyle,
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const apiRequest = async (endpoint, body) => {
    const res = await fetch(`${apiBase}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Request failed");
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(isRegister ? "Registering..." : "Logging in...");

    try {
      const endpoint = isRegister ? "register" : "login";
      const body = {
        email: form.email.trim(),
        password: form.password.trim(),
        ...(isRegister && { name: form.name.trim(), phone: form.phone.trim() }),
      };

      const data = await apiRequest(endpoint, body);

      if (isRegister) {
        setMessage("Registered successfully!");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        if (data.access_token) {
          localStorage.setItem("api_token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setMessage("Login successful!");
          setTimeout(() => (window.location.href = "/users"), 1000);
        }
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("Logging in with Google...");
    try {
      const data = await apiRequest("google-login", {
        token: credentialResponse.credential,
      });
      localStorage.setItem("api_token", data.access_token || data.google_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Google login successful!");
      window.location.href = "/users";
    } catch (err) {
      setMessage(err.message);
    }
  };
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "5rem auto",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>
        {isRegister ? "Register" : "Login"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isRegister && (
          <input name="name" type="text" placeholder="Name" required onChange={handleChange} style={inputStyle} />
        )}
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} style={inputStyle} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} style={inputStyle} />
        {isRegister && (
          <input name="phone" type="text" placeholder="Phone (optional, for WhatsApp)" onChange={handleChange} style={inputStyle} />
        )}
        <button type="submit" style={buttonStyle}>
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <div style={{ textAlign: "center", margin: "1rem 0" }}>OR</div>
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("Google login failed")} />
      <p
        style={{ textAlign: "center", marginTop: "1rem", color: "blue", cursor: "pointer" }}
        onClick={() => setIsRegister((prev) => !prev)}
      >
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </p>

      {message && (
        <p style={{ textAlign: "center", marginTop: "1rem", color: "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}