import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./Overview.css";

export default function Calendar({ title, offset }) {
  const { role } = useAuth(); // ✅ Check if admin/staff

  const [notes, setNotes] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [text, setText] = useState("");

  const today = new Date();
  const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthId = `${year}-${month + 1}`;
  const notesDocRef = doc(db, "calendarNotes", monthId);

  // Load notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const snap = await getDoc(notesDocRef);
        if (snap.exists()) setNotes(snap.data());
        else setNotes({});
      } catch (err) {
        console.error("Error loading notes:", err);
      }
    };

    fetchNotes();
  }, [year, month]);

  // Save note (admin only)
  const saveNote = async () => {
    if (role !== "admin") return; // ❌ reject staff
    try {
      const updated = { ...notes, [editingDate]: text };
      await setDoc(notesDocRef, updated, { merge: true });
      setNotes(updated);
      setEditingDate(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="calendar-box">
      <h3>{title}</h3>
      <h4>
        {monthDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </h4>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="day-header">
            {d}
          </div>
        ))}

        {/* Empty placeholders */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={"empty-" + i} className="day-cell empty"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayName = new Date(year, month, day).toLocaleDateString(
            undefined,
            { weekday: "short" }
          );

          return (
            <div
              key={day}
              className={`day-cell ${role !== "admin" ? "readonly" : ""}`}
              onClick={() => {
                if (role !== "admin") return; // ❌ block staff
                setEditingDate(day);
                setText(notes[day] || "");
              }}
            >
              <div className="day-number">{day}</div>
              <div className="day-name">{dayName}</div>
              <div className="note-text">{notes[day]}</div>
            </div>
          );
        })}
      </div>

      {/* Popup Editor (admin only) */}
      {editingDate && role === "admin" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Note — {editingDate}</h3>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter note..."
            />

            <div className="modal-actions">
              <button onClick={saveNote}>Save</button>
              <button onClick={() => setEditingDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
