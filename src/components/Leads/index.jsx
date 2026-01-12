import React, { useState } from "react";

const Leads = () => {
  const [fullView, setFullView] = useState(false);

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/1SX4u8m02zajWQGDgsgxu7Q1ddnq9lAtiGahlsJJNb-Q/edit?usp=sharing";

  return (
    <div
      style={{
        padding: fullView ? "0" : "20px",
        height: fullView ? "100vh" : "calc(100vh - 80px)",
        width: "100%",
        position: fullView ? "fixed" : "relative",
        top: fullView ? 0 : "auto",
        left: fullView ? 0 : "auto",
        background: "#fff",
        zIndex: fullView ? 9999 : "auto",
      }}
    >
      {!fullView && (
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Embedded Excel / Google Sheet
        </h1>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setFullView(!fullView)}
        style={{
          position: "absolute",
          top: fullView ? "10px" : "20px",
          right: fullView ? "10px" : "20px",
          padding: "8px 14px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 10000,
        }}
      >
        {fullView ? "Exit Full View" : "Full View"}
      </button>

      {/* Sheet Frame */}
      <iframe
        title="Google Sheet"
        src={sheetUrl}
        width="100%"
        height="100%"
        style={{
          border: "1px solid #ccc",
          marginTop: fullView ? "0" : "10px",
        }}
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default Leads;
