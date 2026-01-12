import React from "react";

export default function ExamResult() {
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Exam Results</h2>
        <p style={styles.subtitle}>
          View the latest intern exam results below. Data updates automatically
          as applicants complete the assessment.
        </p>
      </div>

      {/* CONTENT */}
      <div style={styles.card}>
        <iframe
          src="https://docs.google.com/spreadsheets/d/1LU7reVO5oS_AVnhmDHtaqZ1iilUgNH6g57-ky6on2Yg/edit?usp=sharing"
          title="Exam Results"
          style={styles.iframe}
          loading="lazy"
        >
          Loading exam results…
        </iframe>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    fontSize: "1.6rem",
    marginBottom: "6px",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#9ca3af",
    maxWidth: "600px",
    lineHeight: "1.5",
  },
  card: {
    background: "#0f172a",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #1f2937",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  iframe: {
    width: "100%",
    height: "800px",
    border: "none",
  },
};
