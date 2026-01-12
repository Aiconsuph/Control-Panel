import { useState } from "react";

export default function AddUserForm({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://backend-controlpanel-1.onrender.com/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert("✅ User created successfully");
      onUserAdded();
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        <h3>Add New User</h3>

        <div className="form-group">
          <label>Name</label>
          <input
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Temporary Password</label>
          <input
            placeholder="Enter temporary password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="client">Client</option>
            <option value="client">Interns</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>

      <style>{`
  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px;
    width: 100%;
  }

  .form-card {
    background: #1f2937;
    color: #f9fafb;
    padding: 25px 30px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.5rem;
    color: #e5e7eb;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    font-size: 0.9rem;
    color: #9ca3af;
    margin-bottom: 6px;
  }

  input,
  select {
    width: 100%;
    padding: 12px;
    border: 1px solid #374151;
    border-radius: 10px;
    background: #111827;
    color: #f9fafb;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }

  button {
    padding: 12px;
    margin-top: 10px;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.2s;
  }

  button:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  button:disabled {
    background: #3b82f6;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* =======================
      📱 MOBILE RESPONSIVE
     =======================*/
  @media (max-width: 600px) {
    .form-container {
      padding: 15px;
    }

    .form-card {
      padding: 20px;
    }

    h3 {
      font-size: 1.25rem;
    }

    input,
    select {
      padding: 10px;
      font-size: 0.95rem;
    }

    button {
      padding: 10px;
      font-size: 0.95rem;
    }
  }

  /* Extra small devices */
  @media (max-width: 400px) {
    .form-card {
      padding: 15px;
      border-radius: 8px;
    }

    input,
    select {
      padding: 9px;
    }
  }
`}</style>
    </div>
  );
}
