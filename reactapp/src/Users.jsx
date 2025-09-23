import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const apiToken = localStorage.getItem("api_token");

  const apiRequest = async (url, method = "GET", body = null) => {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const loadUsers = async () => {
    try {
      const data = await apiRequest("http://127.0.0.1:8000/api/users");
      setUsers(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiRequest(
          `http://127.0.0.1:8000/api/users/${editingId}`,
          "PUT",
          form
        );
        setMessage("✅ User updated successfully");
      } else {
        await apiRequest("http://127.0.0.1:8000/api/users", "POST", form);
        setMessage("✅ User created successfully");
      }
      setForm({ name: "", email: "", password: "" });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiRequest(`http://127.0.0.1:8000/api/users/${id}`, "DELETE");
      setMessage("✅ User deleted successfully");
      loadUsers();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const goToPayment = () => {
    navigate("/payment"); 
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Users Management</h2>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          onClick={goToPayment}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "5px",
            border: "none",
            background: "#5cb85c",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Make Payment
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "1rem",
          background: "#f9f9f9",
          borderRadius: "8px",
          marginBottom: "1rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{
            padding: "0.6rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            padding: "0.6rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required={!editingId}
          style={{
            padding: "0.6rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          name="phone"
          type="text"
          placeholder="Phone (WhatsApp number with country code, e.g. +919876543210)"
          value={form.phone || ""}
          onChange={handleChange}
          style={{
            padding: "0.6rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.7rem",
            border: "none",
            borderRadius: "5px",
            background: editingId ? "#f0ad4e" : "#5cb85c",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {editingId ? "Update User" : "Add User"}
        </button>
      </form>

      {message && (
        <p style={{ textAlign: "center", color: "green" }}>{message}</p>
      )}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              padding: "1rem",
              borderRadius: "8px",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{u.name}</strong>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                {u.email}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleEdit(u)}
                style={{
                  background: "#0275d8",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.5rem 0.8rem",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(u.id)}
                style={{
                  background: "#d9534f",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.5rem 0.8rem",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}