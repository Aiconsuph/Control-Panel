// Control-Panel\src\components\Overview\index.jsx
import React, { useEffect, useState } from "react";
import Calendar from "./Calendar";
import "./Overview.css";

export default function Overview() {
  const [time, setTime] = useState(new Date());
  const [clockedInAdmins, setClockedInAdmins] = useState(0);
  const [clockedInStaff, setClockedInStaff] = useState(0);
  const [clockedInInterns, setClockedInInterns] = useState(0);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch and count active clock-ins
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("https://backend-controlpanel-1.onrender.com/get-all-attendance");
        const data = await res.json();
        console.log("all attendance raw:", data.records);

        // Filter only active clock-ins
        const activeRecords = data.records.filter(r => r.clockOut == null);

        // Count by role
        const admins = activeRecords.filter(r => r.role === "admin").length;
        const staff = activeRecords.filter(r => r.role === "staff").length;
        const interns = activeRecords.filter(r => r.role === "intern").length;

        setClockedInAdmins(admins);
        setClockedInStaff(staff);
        setClockedInInterns(interns);
      } catch (err) {
        console.error("Error loading attendance:", err);
      }
    }

    loadData();

    // Optional: refresh counts every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overview-container">

      {/* CLOCK */}
      <div className="clock-box">
        <h2>{time.toLocaleTimeString()}</h2>
        <p>
          {time.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* COUNTERS */}
      <div className="counter-row">
        <div className="counter-card">
          <h3>Admins Clocked In</h3>
          <span>{clockedInAdmins}</span>
        </div>

        <div className="counter-card">
          <h3>Staffs Clocked In</h3>
          <span>{clockedInStaff}</span>
        </div>

        <div className="counter-card">
          <h3>Interns Clocked In</h3>
          <span>{clockedInInterns}</span>
        </div>
      </div>

      {/* CALENDARS */}
      <div className="calendar-row">
        <Calendar title="Current Month" offset={0} />
        <Calendar title="Next Month" offset={1} />
      </div>

    </div>
  );
}
