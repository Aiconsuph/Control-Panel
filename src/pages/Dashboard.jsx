// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

import UserManagement from "../components/UserManagement";
import Reports from "../components/Reports";
import ProductCatalog from "../components/ProductCatalog";
import Inquiries from "../components/Inquiries";
import Overview from "../components/Overview";
import Profile from "../components/Profile";
import Leads from "../components/Leads";
import Documents from "../components/Documents";
import Iexam from "../components/Iexam";

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const [selected, setSelected] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ APPROVAL STATE
  const [approved, setApproved] = useState(false);

  // ✅ Fetch latest approved status from backend
  useEffect(() => {
    if (!user) return;

    const fetchApproval = async () => {
      try {
        const res = await fetch(
          `https://backend-controlpanel-1.onrender.com/get-user/${user.uid}`
        );
        const data = await res.json();
        if (data.user) setApproved(data.user.approved || false);
      } catch (err) {
        console.error("Failed to fetch approval:", err);
      }
    };

    fetchApproval();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  const renderContent = () => {
    // ADMIN ONLY
    if (role === "admin" && selected === "User Management") return <UserManagement />;
    if (role === "admin" && selected === "Reports") return <Reports />;

    // DASHBOARD
    if (role !== "client" && selected === "Dashboard") return <Overview />;

    // LEADS ACCESS CONTROL
    if (selected === "Leads") {
      if (role === "admin" || role === "staff") return <Leads />;
      if (role === "intern" && approved) return <Leads />;
      if (role === "intern" && !approved)
        return (
          <div style={{ padding: 20, color: "#fbbf24" }}>
            ⛔ Your account is pending approval. Please wait for an admin to approve your access to Leads.
          </div>
        );
      return <p>Access denied.</p>;
    }

    // OTHER PAGES
    if (role !== "client" && selected === "Inquiries") return <Inquiries />;
    if (role !== "client" && selected === "Internship Exam") return <Iexam />;

    switch (selected) {
      case "Product Catalog":
        return <ProductCatalog />;
      case "FB Posted Products":
        return <Documents />;
      case "Profile":
        return <Profile />;
      default:
        return <p>Select a section from the sidebar.</p>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        onSelect={(item) => {
          setSelected(item);
          setSidebarOpen(false);
        }}
        mobileOpen={sidebarOpen}
      />

      <main className="main-area">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>

        <header className="header">
          <h1>{selected}</h1>
          <p>
            Welcome,{" "}
            <strong>
              {role === "admin"
                ? "Admin"
                : role === "staff"
                ? "Staff"
                : role === "intern"
                ? "Intern"
                : "User"}
            </strong>{" "}
            ({user.email})
          </p>
        </header>

        <section className="content">{renderContent()}</section>
      </main>

      <style>{`
        body {
          margin: 0;
          min-height: 100vh;
          background-image: url("/bg_AiconImage.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .dashboard-wrapper {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          color: #f9fafb;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9;
        }

        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .header {
          border-bottom: 1px solid #1e293b;
          margin-bottom: 20px;
        }

        h1 {
          color: #facc15;
          margin: 0 0 5px;
        }

        .content {
          flex: 1;
          padding: 20px;
          border-radius: 10px;
        }

        .hamburger {
          display: none;
        }

        @media (max-width: 900px) {
          .hamburger {
            display: block;
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 10;
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 12px;
            border-radius: 6px;
            color: white;
          }

          .main-area {
            padding-top: 55px;
          }
        }
      `}</style>
    </div>
  );
}
