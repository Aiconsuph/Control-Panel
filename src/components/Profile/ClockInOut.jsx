// src/components/Profile/ClockInOut.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ACTIVE_KEY = "activeAttendanceId";

function normalizeDate(value) {
  if (!value) return null;
  // Firestore-like object with _seconds
  if (typeof value === "object" && value._seconds) {
    return new Date(value._seconds * 1000);
  }
  // ISO string
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }
  // Date instance
  if (value instanceof Date) return value;
  return null;
}

export default function ClockInOut() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Checking...");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const checkStatus = async () => {
    try {
      const res = await fetch(`https://backend-controlpanel-1.onrender.com/get-attendance/${user.uid}`);
      const data = await res.json();
      const records = data.records || [];

      // prefer the active id saved in localStorage (persist across navigation)
      const storedId = localStorage.getItem(ACTIVE_KEY);

      // find record by storedId if present
      let active = null;
      if (storedId) {
        active = records.find((r) => r.id === storedId) || null;
      }

      // if no stored active record, fall back to the latest active (clockOut === null)
      if (!active) {
        active = records.find((r) => r.clockOut == null) || null;
      }

      if (active) {
        setCurrentRecord(active);
        setStatus("Clocked In");
        setTotalHours(null);
        // ensure localStorage is in sync
        localStorage.setItem(ACTIVE_KEY, active.id);
        return;
      }

      // No active clock-in found. If there's a latest finished record we can show hours
      if (records.length > 0) {
        const latest = records[0];
        if (latest.clockIn && latest.clockOut) {
          const hrs = calculateHours(latest.clockIn, latest.clockOut);
          setTotalHours(hrs);
        } else {
          setTotalHours(null);
        }
      }

      setStatus("Clocked Out");
      setCurrentRecord(null);
      localStorage.removeItem(ACTIVE_KEY);
    } catch (err) {
      console.error("Error checking status:", err);
      setStatus("Clocked Out");
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await fetch("https://backend-controlpanel-1.onrender.com/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });

      const result = await res.json();
      if (!result.success || !result.record) throw new Error("Clock-in failed");

      const rec = result.record;
      // Use server-returned record (id, clockIn, ...)
      setCurrentRecord(rec);
      setStatus("Clocked In");
      setTotalHours(null);
      // persist active record id to survive navigation
      localStorage.setItem(ACTIVE_KEY, rec.id);
    } catch (err) {
      console.error("Clock-in failed:", err);
      alert("❌ Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    if (!currentRecord?.id) {
      alert("⚠️ No active session found to clock out!");
      return;
    }

    try {
      const res = await fetch("https://backend-controlpanel-1.onrender.com/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, recordId: currentRecord.id }),
      });

      const result = await res.json();
      if (!result.success || !result.record) throw new Error("Clock-out failed");

      const updated = result.record;

      // calculate hours using normalized dates
      const hours = calculateHours(updated.clockIn, updated.clockOut);

      setStatus("Clocked Out");
      setTotalHours(hours);
      setCurrentRecord(null);
      localStorage.removeItem(ACTIVE_KEY);
    } catch (err) {
      console.error("Clock-out failed:", err);
      alert("❌ Failed to clock out");
    }
  };

  function calculateHours(clockIn, clockOut) {
    const inDate = normalizeDate(clockIn);
    const outDate = normalizeDate(clockOut);
    if (!inDate || !outDate) return 0;
    const diffMs = outDate - inDate;
    const hours = diffMs / (1000 * 60 * 60);
    if (!isFinite(hours) || isNaN(hours)) return 0;
    return parseFloat(hours.toFixed(2));
  }

  return (
    <div style={card}>
      <h3>Attendance</h3>
      <p>
        Status: <strong>{status}</strong>
      </p>

      {status === "Clocked Out" ? (
        <button onClick={handleClockIn}>Clock In</button>
      ) : status === "Clocked In" ? (
        <button onClick={handleClockOut}>Clock Out</button>
      ) : (
        <p>Checking status...</p>
      )}

      {totalHours !== null && (
        <p style={{ marginTop: "10px", color: "#facc15" }}>
          ⏱ Total Hours Worked: {totalHours} hrs
        </p>
      )}
    </div>
  );
}

const card = {
  backgroundColor: "rgba(30, 41, 59, 0.35)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "20px",
};
