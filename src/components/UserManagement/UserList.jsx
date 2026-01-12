import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserList({ refresh }) {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "https://backend-controlpanel-1.onrender.com/get-users"
      );
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleDelete = async (uid, userRole) => {
    if (userRole === "admin") {
      alert("❌ You cannot delete an admin!");
      return;
    }
    if (confirm("Delete this user?")) {
      try {
        const res = await fetch(
          `https://backend-controlpanel-1.onrender.com/delete-user/${uid}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u.uid);
    setEditData({ name: u.name, email: u.email, role: u.role });
  };

  const handleSave = async (uid) => {
    try {
      const res = await fetch(
        `https://backend-controlpanel-1.onrender.com/update-user/${uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleApprove = async (uid) => {
    if (!confirm("Approve this intern?")) return;

    try {
      const res = await fetch(
        `https://backend-controlpanel-1.onrender.com/update-user/${uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved: true }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      fetchUsers();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="user-list">
      <h3>👥 User Management</h3>

      {users.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td>
                      {editingUser === u.uid ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      ) : (
                        u.name
                      )}
                    </td>

                    <td>
                      {editingUser === u.uid ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                        />
                      ) : (
                        u.email
                      )}
                    </td>

                    <td>
                      {editingUser === u.uid ? (
                        <select
                          value={editData.role}
                          onChange={(e) =>
                            setEditData({ ...editData, role: e.target.value })
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="intern">Intern</option>
                          <option value="client">Client</option>
                        </select>
                      ) : (
                        <>
                          {u.role}
                          {u.role === "intern" && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 12,
                                color: u.approved ? "#10b981" : "#fbbf24",
                              }}
                            >
                              ({u.approved ? "Approved" : "Pending"})
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="actions">
                      {editingUser === u.uid ? (
                        <>
                          <button
                            className="save"
                            onClick={() => handleSave(u.uid)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="edit"
                            onClick={() => handleEdit(u)}
                          >
                            Edit
                          </button>

                          {u.role === "intern" && u.approved === false && (
                            <button
                              className="save"
                              onClick={() => handleApprove(u.uid)}
                            >
                              Approve
                            </button>
                          )}

                          <button
                            className="delete"
                            onClick={() => handleDelete(u.uid, u.role)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="user-cards">
            {users.map((u) => (
              <div className="user-card" key={u.uid}>
                <div>
                  <strong>Name:</strong> {u.name}
                </div>
                <div>
                  <strong>Email:</strong> {u.email}
                </div>
                <div>
                  <strong>Role:</strong> {u.role}{" "}
                  {u.role === "intern" && (
                    <span style={{ color: u.approved ? "#10b981" : "#fbbf24" }}>
                      ({u.approved ? "Approved" : "Pending"})
                    </span>
                  )}
                </div>

                <div className="card-actions">
                  <button onClick={() => handleEdit(u)}>Edit</button>

                  {u.role === "intern" && u.approved === false && (
                    <button
                      style={{ background: "#10b981", color: "white" }}
                      onClick={() => handleApprove(u.uid)}
                    >
                      Approve
                    </button>
                  )}

                  <button onClick={() => handleDelete(u.uid, u.role)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .user-list {
          background: #1f2937;
          padding: 1.5rem;
          border-radius: 12px;
          color: #f9fafb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #374151;
        }
        th,
        td {
          padding: 12px;
          border-bottom: 1px solid #4b5563;
        }
        th {
          background: #111827;
        }
        button {
          margin: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }
        .edit {
          background: #3b82f6;
          color: white;
        }
        .delete {
          background: #ef4444;
          color: white;
        }
        .save {
          background: #10b981;
          color: white;
        }
        .cancel {
          background: #6b7280;
          color: white;
        }
        .user-cards {
          display: none;
        }
        @media (max-width: 520px) {
          table {
            display: none;
          }
          .user-cards {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
