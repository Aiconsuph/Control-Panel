import React, { useState } from "react";
import { db } from "../../firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function InquiryModal({ item, close }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false); // fade-out animation

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "inquiries"), {
        product: item,
        email,
        message,
        createdAt: serverTimestamp(),
      });

      // Start fade-out animation
      setClosing(true);

      // Wait for animation then close
      setTimeout(() => {
        close();
      }, 300);

      alert("Inquiry sent successfully!");

    } catch (error) {
      console.error(error);
      alert("Error sending inquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-backdrop ${closing ? "fade-out" : ""}`}>
      <div className={`modal-card ${closing ? "fade-out-card" : ""}`}>
        <h2>Inquiry for: <span style={{ color: "#0077cc" }}>{item}</span></h2>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Your Message</label>
          <textarea
            rows="4"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Sending..." : "Send Inquiry"}
          </button>

          <button type="button" onClick={close} className="cancel-btn">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
