import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DailyReports() {
  const { user } = useAuth();
  const [report, setReport] = useState("");
  const [date, setDate] = useState("");
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  // -------------------------- DATE HELPERS --------------------------
  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val === "object" && "_seconds" in val) return new Date(val._seconds * 1000);
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d)) return d;
    }
    if (val instanceof Date) return val;
    return null;
  };

  const formatDisplayDate = (val) => {
    const d = parseDate(val);
    if (!d) return "Invalid Date";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateInput = (val) => {
    const d = parseDate(val) || new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };


const combineDateWithCurrentTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();

  d.setHours(now.getHours());
  d.setMinutes(now.getMinutes());
  d.setSeconds(now.getSeconds());
  d.setMilliseconds(now.getMilliseconds());

  return d;
};


  // -------------------------- FETCH REPORTS --------------------------
  const fetchReports = async () => {
    const res = await fetch(`https://backend-controlpanel-1.onrender.com/get-reports/${user.uid}`);
    const data = await res.json();
    setReports(data.reports || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // -------------------------- SUBMIT / UPDATE --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const reportDate = date
  ? combineDateWithCurrentTime(date)
  : new Date();

    const payload = { uid: user.uid, email: user.email, report, date: reportDate.toISOString() };
    let url = "https://backend-controlpanel-1.onrender.com/add-report";
    let method = "POST";

    if (editingId) {
      url = `https://backend-controlpanel-1.onrender.com/update-report/${editingId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(data.message || data.error);

    setReport("");
    setDate("");
    setEditingId(null);
    fetchReports();
  };

  // -------------------------- EDIT --------------------------
  const editReport = (item) => {
    setEditingId(item.id);
    setReport(item.report);
    setDate(formatDateInput(item.date));
  };

  // -------------------------- DELETE --------------------------
  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;
    const res = await fetch(`https://backend-controlpanel-1.onrender.com/delete-report/${id}`, { method: "DELETE" });
    const data = await res.json();
    setMsg(data.message || data.error);
    fetchReports();
  };

  // -------------------------- PDF EXPORT --------------------------
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Daily Reports", 14, 20);

    const tableData = reports.map((r) => [formatDisplayDate(r.date), r.report]);
    autoTable(doc, {
      head: [["Date", "Report"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      styles: { fontSize: 10 },
    });

    doc.save("daily-reports.pdf");
  };

  return (
    <div className="daily-reports">
      <h3>Daily Report</h3>
      <button className="pdf-btn" onClick={exportPDF}>
        📄 Export PDF
      </button>

      <form onSubmit={handleSubmit} className="report-form">
        <label>Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="date-picker"
        />

        <textarea
          placeholder="What did you do today?"
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
        />

        <div className="form-buttons">
          <button type="submit">{editingId ? "Update" : "Submit"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setReport("");
                setDate("");
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <p>{msg}</p>
      <hr />

      <h4>Previous Reports</h4>
      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <ul className="report-list">
          {reports.map((r) => (
            <li key={r.id}>
              <strong>{formatDisplayDate(r.date)}</strong>
              <p>{r.report}</p>
              <div className="actions">
                <button onClick={() => editReport(r)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => deleteReport(r.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .daily-reports {
            backgroundColor: "rgba(30, 41, 59, 0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "20px",
        }

        .pdf-btn {
          background: #facc15;
          color: #1f2937;
          font-weight: bold;
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 15px;
        }

        .report-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        input,
        textarea {
          width: 100%;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-size: 0.9rem;
        }

        .date-picker {
          max-width: 180px;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        button[type="submit"] {
          background: #3b82f6;
          color: #fff;
          font-weight: bold;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: auto;
        }

        .cancel-btn {
          background: #6b7280;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          width: auto;
        }

        .report-list {
          list-style: none;
          padding: 0;
        }

        .report-list li {
          background: #fff;
          color: #111827;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          margin-bottom: 10px;
        }

        .actions {
          margin-top: 8px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .edit-btn,
        .delete-btn {
          padding: 4px 10px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .edit-btn {
          background: #3b82f6;
          color: #fff;
        }

        .delete-btn {
          background: #ef4444;
          color: #fff;
        }

        @media (max-width: 640px) {
          .form-buttons {
            flex-direction: column;
          }
          .pdf-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
