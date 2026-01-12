// src\components\Iexam\index.jsx
// src/components/Iexam/index.jsx
import React from "react";

export default function Iexam() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Intern Application Exam</h2>
      <p style={styles.subtitle}>
        Please complete the form below and make sure all answers are final before submitting. After the exam, please wait for further instructions regarding your interview schedule.
      </p>

      <div style={styles.iframeWrapper}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfRZal4xugh7dfMn4GnmAylxWtMRNZulkp-qKlE5ljzjHlOLg/viewform?embedded=true"
          width="100%"
          height="1100"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="Intern Exam Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    marginBottom: "15px",
  },
  iframeWrapper: {
    background: "#0f172a",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1f2937",
  },
};
