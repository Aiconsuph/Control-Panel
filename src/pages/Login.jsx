// Control-Panel/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

/** 🔐 HARD-CODED ADMIN CREATE CODE */
const ADMIN_CREATE_CODE = "AICON-ADMIN-2026";

export default function Login() {
  const [isCreating, setIsCreating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("intern");
  const [adminCode, setAdminCode] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userApproved", data.approved);
        navigate("/dashboard");
      } else {
        alert("⚠️ No user record found.");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }

    setLoading(false);
  };

  /* ================= CREATE ACCOUNT ================= */
  const handleSignup = async () => {
    if (adminCode !== ADMIN_CREATE_CODE) {
      alert("Unauthorized account creation.");
      return;
    }

    if (!name || !email || !password) {
      alert("Please complete all fields.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        role,
        approved: role === "intern" ? false : true, // 👈 KEY LINE
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      navigate("/dashboard");
    } catch (err) {
      alert("Account creation failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* LOGO */}
        <img
          src="https://raw.githubusercontent.com/Olegario-III/image/main/aicon%20Logo.jpg"
          alt="Aicon Logo"
          className="logo"
        />

        <h2>{isCreating ? "Create Account" : "Welcome Back"}</h2>
        <p className="subtitle">
          {isCreating
            ? "Admin-only account creation"
            : "Sign in to access the Control Panel"}
        </p>

        {/* LOGIN */}
        {!isCreating && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Login"}
            </button>
          </form>
        )}

        {/* CREATE ACCOUNT */}
        {isCreating && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="intern">Intern</option>
              <option value="client">Client</option>
              <option value="staff">Staff</option>
            </select>

            <input
              type="password"
              placeholder="Admin code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{ background: "#10b981" }}
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </>
        )}

        {/* TOGGLE */}
        <button
          className="toggle-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "← Back to Login" : "Create an Account"}
        </button>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #111827 0%, #000 80%);
          color: #e5e7eb;
          font-family: Inter, sans-serif;
        }

        .login-box {
          background: rgba(31, 41, 55, 0.85);
          padding: 40px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .logo {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin-bottom: 20px;
          background: #fff;
          padding: 4px;
        }

        input,
        select {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          border-radius: 8px;
          border: 1px solid #374151;
          background: #1f2937;
          color: white;
        }

        button {
          width: 100%;
          margin-top: 15px;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        .toggle-btn {
          background: transparent;
          color: #9ca3af;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
