import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === "object" && value._seconds) return new Date(value._seconds * 1000);
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }
  if (value instanceof Date) return value;
  return null;
}

function formatDateTime(date) {
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`https://backend-controlpanel-1.onrender.com/get-attendance/${user.uid}`);
        const data = await res.json();
        const recs = data.records || [];

        const normalized = recs.map((r) => ({
          ...r,
          clockInDate: normalizeDate(r.clockIn),
          clockOutDate: normalizeDate(r.clockOut),
        }));

        setRecords(normalized);

        let total = 0;
        normalized.forEach((r) => {
          const inD = r.clockInDate;
          const outD = r.clockOutDate;
          if (inD && outD) total += (outD - inD) / (1000 * 60 * 60);
        });
        setTotalHours(total);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setRecords([]);
        setTotalHours(0);
      }
    };

    fetchAttendance();
  }, [user.uid]);

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Attendance History", 14, 20);

    const tableData = records.map((r) => [
      formatDateTime(r.clockInDate),
      formatDateTime(r.clockOutDate),
      r.clockInDate && r.clockOutDate
        ? ((r.clockOutDate - r.clockInDate) / (1000 * 60 * 60)).toFixed(2)
        : "—",
    ]);

    autoTable(doc, {
      head: [["Clock In", "Clock Out", "Hours"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0 },
      styles: { fontSize: 10 },
    });

    doc.setFontSize(12);
    doc.text(`Total Work Hours: ${totalHours.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save("attendance-history.pdf");
  };

  return (
    <div className="attendance-history">
      <h3>Attendance History</h3>
      <button className="pdf-btn" onClick={exportPDF}>
        📄 Export PDF
      </button>

      {records.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <>
          <table className="records-table">
            <thead>
              <tr>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const clockIn = r.clockInDate;
                const clockOut = r.clockOutDate;
                const hours =
                  clockIn && clockOut ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2) : "—";
                return (
                  <tr key={r.id}>
                    <td>{formatDateTime(clockIn)}</td>
                    <td>{formatDateTime(clockOut)}</td>
                    <td>{hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="records-cards">
            {records.map((r) => {
              const clockIn = r.clockInDate;
              const clockOut = r.clockOutDate;
              const hours =
                clockIn && clockOut ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2) : "—";
              return (
                <div className="card" key={r.id}>
                  <p>
                    <strong>Clock In:</strong> {formatDateTime(clockIn)}
                  </p>
                  <p>
                    <strong>Clock Out:</strong> {formatDateTime(clockOut)}
                  </p>
                  <p>
                    <strong>Hours:</strong> {hours}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="total-hours">Total Work Hours: {totalHours.toFixed(2)}</p>

      <style jsx>{`
        .attendance-history {
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
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 10px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #374151;
          border-radius: 8px;
          overflow: hidden;
        }

        th,
        td {
          padding: 10px;
          border-bottom: 1px solid #475569;
        }

        th {
          background: #1f2937;
          text-align: left;
        }

        .records-cards {
          display: none;
        }

        .card {
          background: #334155;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .total-hours {
          margin-top: 10px;
          font-weight: bold;
          color: #facc15;
        }

        @media (max-width: 640px) {
          table.records-table {
            display: none;
          }
          .records-cards {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
