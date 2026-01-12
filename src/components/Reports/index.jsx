import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://backend-controlpanel.onrender.com/get-all-reports");
      const data = await res.json();
      setReports(data.records || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await fetch(`https://backend-controlpanel.onrender.com/delete-report/${id}`, { method: "DELETE" });
      fetchReports();
    } catch {
      alert("Failed to delete report");
    }
  };

  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val === "object" && val._seconds) return new Date(val._seconds * 1000);
    return new Date(val);
  };

  const formatDisplayDate = (val) => {
    const d = parseDate(val);
    if (!d) return "-";
    return d.toLocaleDateString();
  };

  const formatFullDate = (val) => {
    const d = parseDate(val);
    if (!d) return "-";
    return d.toLocaleTimeString(undefined, { hour12: true, hour: "numeric", minute: "2-digit" });
  };

  // Group reports by date
  const groupedReports = reports.reduce((acc, r) => {
    const day = formatDisplayDate(r.date);
    if (!acc[day]) acc[day] = [];
    acc[day].push(r);
    return acc;
  }, {});

  // ---------------- PDF EXPORT ----------------
  const exportPDF = (date, items) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Reports - ${date}`, 14, 20);

    const tableData = items.map((r) => [r.email || "Unknown", r.report, formatFullDate(r.date)]);
    autoTable(doc, {
      head: [["User", "Report", "Time"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      styles: { fontSize: 10 },
    });

    doc.save(`reports-${date}.pdf`);
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>

      {loading && <p>Loading reports...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && reports.length === 0 && <p>No reports found.</p>}

      {!loading &&
        Object.entries(groupedReports).map(([date, items]) => (
          <div key={date} className="report-day">
            <div className="day-header">
              <h3>{date}</h3>
              <button className="pdf-btn" onClick={() => exportPDF(date, items)}>
                📄 Export PDF
              </button>
            </div>

            {/* Desktop table */}
            <table className="desktop-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Report</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.email || "Unknown"}</td>
                    <td>{r.report}</td>
                    <td>{formatFullDate(r.date)}</td>
                    <td>
                      <button onClick={() => deleteReport(r.id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {items.map((r) => (
                <div key={r.id} className="card">
                  <p><strong>User:</strong> {r.email || "Unknown"}</p>
                  <p><strong>Report:</strong> {r.report}</p>
                  <p><strong>Time:</strong> {formatFullDate(r.date)}</p>
                  <button onClick={() => deleteReport(r.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

      <style jsx>{`
        .reports-container {
          padding: 16px;
          background: #f3f4f6;
          color: #111827;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .pdf-btn {
          background: #facc15;
          color: #1f2937;
          font-weight: bold;
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          background: #fff;
          border-radius: 6px;
          overflow: hidden;
        }

        th, td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }

        th {
          background: #e5e7eb;
        }

        .delete-btn {
          background: #ef4444;
          color: #fff;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .mobile-cards {
          display: none;
        }

        .card {
          background: #ffffff;
          color: #111827;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 10px;
          border: 1px solid #d1d5db;
        }

        @media (max-width: 768px) {
          .desktop-table {
            display: none;
          }
          .mobile-cards {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
