// Control-Panel\src\components\Profile\index.jsx
import { useState } from "react";
import ClockInOut from "./ClockInOut";
import DailyReports from "./DailyReports";
import AttendanceHistory from "./AttendanceHistory";
import ChangePassword from "./ChangePassword";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("ClockInOut");

  const tabs = [
    { name: "ClockInOut", label: "Clock In / Out" },
    { name: "DailyReports", label: "Daily Reports" },
    { name: "AttendanceHistory", label: "Attendance History" },
    { name: "ChangePassword", label: "Change Password" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "ClockInOut":
        return <ClockInOut />;
      case "DailyReports":
        return <DailyReports />;
      case "AttendanceHistory":
        return <AttendanceHistory />;
      case "ChangePassword":
        return <ChangePassword />;
      default:
        return null;
    }
  };

  return (
    <div className="profile">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={activeTab === tab.name ? "active" : ""}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="content">{renderTab()}</div>

      <style>{`
        .profile {
          color: white;
          max-width: 100%;
          padding: 10px;
        }

        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }

        button {
          background: #334155;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          flex: 1 1 auto; /* buttons grow and shrink */
          min-width: 120px; /* prevent them from being too small */
          text-align: center;
        }

        button.active {
          background: #facc15;
          color: #1f2937;
          font-weight: bold;
        }

        .content {
          background: #1e293b;
          padding: 20px;
          border-radius: 10px;
          overflow-x: auto; /* allows horizontal scroll if content is wide */
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .tabs {
            flex-direction: column;
          }

          button {
            width: 100%;
          }

          .content {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}
