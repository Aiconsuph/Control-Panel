// Control-Panel\src\components\UserManagement\Attendance.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firestore";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./Attendance.css";

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  // -----------------------------
  // Helpers: parse + format dates
  // -----------------------------
  const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    if (typeof value === "object" && value.seconds) return new Date(value.seconds * 1000);
    return null;
  };

  const formatReadable = (value) => {
    const d = toDate(value);
    if (!d) return "";
    const opts = { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
    return d.toLocaleString("en-US", opts).replace(", ", " ");
  };

  const toISOStringSafe = (value) => {
    const d = toDate(value);
    return d ? d.toISOString() : "";
  };

  const getTotalHours = (clockIn, clockOut) => {
    const start = toDate(clockIn);
    const end = toDate(clockOut);
    if (!start || !end) return 0;
    const ms = end - start;
    return ms > 0 ? (ms / 1000 / 60 / 60).toFixed(2) : 0;
  };

  // -----------------------------
  // Fetch attendance
  // -----------------------------
  const fetchAttendance = async () => {
    try {
      const snap = await getDocs(collection(db, "attendance"));
      const data = {};

      snap.forEach((docSnap) => {
        const entry = docSnap.data();
        if (!entry.clockIn) return;

        const clockInIso = toISOStringSafe(entry.clockIn);
        const clockOutIso = toISOStringSafe(entry.clockOut);
        const dateKey = clockInIso ? clockInIso.split("T")[0] : "unknown";

        if (!data[dateKey]) data[dateKey] = [];

        data[dateKey].push({
          ...entry,
          clockInIso,
          clockOutIso,
          clockIn: formatReadable(entry.clockIn),
          clockOut: formatReadable(entry.clockOut),
          totalHours: getTotalHours(entry.clockIn, entry.clockOut),
          id: docSnap.id,
        });
      });

      // sort dates latest first, then records within date by clockIn desc
      const sortedData = Object.keys(data)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((acc, key) => {
          acc[key] = data[key].sort((x, y) => new Date(y.clockInIso) - new Date(x.clockInIso));
          return acc;
        }, {});

      setAttendanceData(sortedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setLoading(false);
    }
  };

  // -----------------------------
  // Export
  // -----------------------------
  const exportToExcel = (day, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Name: r.name,
        Email: r.email,
        "Clock In": r.clockIn,
        "Clock Out": r.clockOut,
        "Total Hours": r.totalHours,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance-${day.replaceAll("-", "_")}.xlsx`);
  };

  const exportToPDF = (day, rows) => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      doc.setFontSize(14);
      doc.text(`Attendance for ${day}`, 40, 40);

      const body = rows.map((r) => [
        r.name || "-",
        r.email || "-",
        r.clockIn || "-",
        r.clockOut || "-",
        r.totalHours || "0.00",
      ]);

      doc.autoTable({
        startY: 60,
        head: [["Name", "Email", "Clock In", "Clock Out", "Total Hours"]],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 40, right: 40 },
      });

      doc.save(`Attendance-${day.replaceAll("-", "_")}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check console.");
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteDoc(doc(db, "attendance", id));
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    }
  };

  // -----------------------------
  // Save edited
  // -----------------------------
  const handleSave = async () => {
    try {
      if (!editRecord?.id) return;
      const { id, clockInIso, clockOutIso, name, email } = editRecord;

      await updateDoc(doc(db, "attendance", id), {
        clockIn: clockInIso || null,
        clockOut: clockOutIso || null,
        name,
        email,
      });

      setEditRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Failed to save record.");
    }
  };

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance Records</h2>

      {Object.keys(attendanceData).length === 0 ? (
        <p>No attendance data found.</p>
      ) : (
        <div className="attendance-grid">
          {Object.keys(attendanceData).map((day) => {
            const rows = attendanceData[day];

            return (
              <div className="attendance-card" key={day}>
                <div className="attendance-card-header">
                  <h3>{day}</h3>
                  <div className="attendance-buttons">
                    <button onClick={() => exportToExcel(day, rows)}>📄 Excel</button>
                    <button onClick={() => exportToPDF(day, rows)}>🖨 PDF</button>
                  </div>
                </div>

                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Total Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                value={editRecord.name}
                                onChange={(e) => setEditRecord({ ...editRecord, name: e.target.value })}
                              />
                            ) : (
                              r.name
                            )}
                          </td>
                          <td>{r.email || "-"}</td>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                type="datetime-local"
                                value={editRecord.clockInIso?.slice(0, 16) || ""}
                                onChange={(e) =>
                                  setEditRecord({
                                    ...editRecord,
                                    clockInIso: new Date(e.target.value).toISOString(),
                                    clockIn: formatReadable(new Date(e.target.value)),
                                  })
                                }
                              />
                            ) : (
                              r.clockIn
                            )}
                          </td>
                          <td>
                            {editRecord?.id === r.id ? (
                              <input
                                type="datetime-local"
                                value={editRecord.clockOutIso?.slice(0, 16) || ""}
                                onChange={(e) =>
                                  setEditRecord({
                                    ...editRecord,
                                    clockOutIso: e.target.value ? new Date(e.target.value).toISOString() : "",
                                    clockOut: e.target.value ? formatReadable(new Date(e.target.value)) : "",
                                  })
                                }
                              />
                            ) : (
                              r.clockOut
                            )}
                          </td>
                          <td>{r.totalHours}</td>
                          <td className="actions">
                            {editRecord?.id === r.id ? (
                              <>
                                <button className="save" onClick={handleSave}>Save</button>
                                <button className="cancel" onClick={() => setEditRecord(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="edit"
                                  onClick={() =>
                                    setEditRecord({
                                      ...r,
                                      clockInIso: r.clockInIso || toISOStringSafe(r.clockIn),
                                      clockOutIso: r.clockOutIso || toISOStringSafe(r.clockOut),
                                    })
                                  }
                                >
                                  Edit
                                </button>
                                <button className="delete" onClick={() => handleDelete(r.id)}>Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE stacked cards */}
                <div className="attendance-mobile">
                  {rows.map((r) => (
                    <div className="attendance-mobile-card" key={`${r.id}-mobile`}>
                      <div className="attendance-mobile-row">
                        <strong>Name:</strong> <div>{r.name || "-"}</div>
                      </div>
                      <div className="attendance-mobile-row">
                        <strong>Email:</strong> <div>{r.email || "-"}</div>
                      </div>
                      <div className="attendance-mobile-row">
                        <strong>Clock In:</strong> <div>{r.clockIn || "-"}</div>
                      </div>
                      <div className="attendance-mobile-row">
                        <strong>Clock Out:</strong> <div>{r.clockOut || "-"}</div>
                      </div>
                      <div className="attendance-mobile-row">
                        <strong>Total Hours:</strong> <div>{r.totalHours}</div>
                      </div>
                      <div className="attendance-mobile-actions">
                        {editRecord?.id === r.id ? (
                          <>
                            <button className="save" onClick={handleSave}>Save</button>
                            <button className="cancel" onClick={() => setEditRecord(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="edit"
                              onClick={() =>
                                setEditRecord({
                                  ...r,
                                  clockInIso: r.clockInIso || toISOStringSafe(r.clockIn),
                                  clockOutIso: r.clockOutIso || toISOStringSafe(r.clockOut),
                                })
                              }
                            >
                              Edit
                            </button>
                            <button className="delete" onClick={() => handleDelete(r.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
