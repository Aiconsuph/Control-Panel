import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelect, mobileOpen }) {
  const { role, logout } = useAuth();

  const menuItems = [
    "Dashboard",
    "Product Catalog",
    "FB Posted Products",
    "Leads",
    "Inquiries",
    "Profile",
    "Internship Exam"
  ];

  const adminOnly = ["User Management", "Reports"];

  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item} onClick={() => onSelect(item)}>
              {item}
            </li>
          ))}

          {role === "admin" &&
            adminOnly.map((item) => (
              <li
                key={item}
                className="admin-item"
                onClick={() => onSelect(item)}
              >
                {item}
              </li>
            ))}
        </ul>

        {/* ✅ LOGOUT BUTTON */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      <style>{`
        .sidebar {
          width: 240px;
          background: #1e293b;
          padding: 20px 0;
          height: 100%;
          border-right: 1px solid #334155;
          position: relative;
          z-index: 11;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 14px 20px;
          cursor: pointer;
          font-size: 1rem;
          color: #e2e8f0;
          transition: 0.2s;
        }

        li:hover {
          background: #334155;
        }

        .admin-item {
          border-top: 1px solid #334155;
          margin-top: 10px;
          padding-top: 16px;
        }

        /* ✅ LOGOUT BUTTON STYLE (dark theme stays consistent) */
        .logout-btn {
          width: 100%;
          margin-top: 20px;
          padding: 12px 20px;
          background: #dc2626; 
          color: white;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: 0.2s;
        }

        .logout-btn:hover {
          background: #b91c1c;
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            height: 100vh;
            transition: left 0.3s ease;
          }

          .sidebar.open {
            left: 0;
          }
        }
      `}</style>
    </aside>
  );
}
