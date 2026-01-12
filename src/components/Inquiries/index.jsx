import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import InquiryView from "./InquiryView";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load inquiries in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inquiries"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInquiries(data);
    });

    return () => unsubscribe();
  }, []);

  // Mobile: Back to list
  const backToList = () => setSelectedInquiry(null);

  return (
    <div className="inquiries-container">

      {/* Left Panel — List */}
      <div className={`list-panel ${selectedInquiry ? "hide-mobile" : ""}`}>
        <h2 className="section-title">Inquiries</h2>

        {inquiries.map((inq) => {
          const isActive = selectedInquiry?.id === inq.id;

          return (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className={`inq-item ${isActive ? "active" : ""}`}
            >
              <div className="inq-header">
                <strong>{inq.name}</strong>

                {inq.replied ? (
                  <span className="badge replied">Replied</span>
                ) : (
                  <span className="badge new">New</span>
                )}
              </div>

              <p>{inq.product}</p>
            </div>
          );
        })}
      </div>

      {/* Right Panel — Details */}
      <div className={`details-panel ${selectedInquiry ? "show-mobile" : ""}`}>
        {selectedInquiry ? (
          <InquiryView inquiry={selectedInquiry} onBack={backToList} />
        ) : (
          <p className="select-msg">Select an inquiry to view details.</p>
        )}
      </div>

      <style>{`
        .inquiries-container {
          display: flex;
          height: 100%;
          background: #0f172a;
          color: #f9fafb;
        }

        /* List Panel */
        .list-panel {
          width: 40%;
          border-right: 1px solid #1e293b;
          overflow-y: auto;
        }

        .section-title {
          padding: 15px;
          margin: 0;
          font-size: 1.5rem;
          color: #facc15;
          border-bottom: 1px solid #1e293b;
        }

        .inq-item {
          padding: 15px;
          cursor: pointer;
          border-bottom: 1px solid #1e293b;
          background: #1e293b;
        }

        .inq-item:hover {
          background: #334155;
        }

        .inq-item.active {
          background: #475569;
        }

        .inq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .badge.new {
          background: #3b82f6;
          color: white;
        }

        .badge.replied {
          background: #22c55e;
          color: #0f172a;
        }

        .inq-item p {
          margin: 6px 0 0;
          opacity: 0.85;
        }

        /* Details Panel */
        .details-panel {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .select-msg {
          opacity: 0.7;
          padding: 20px;
        }

        /* Mobile Layout */
        @media (max-width: 900px) {
          .list-panel {
            width: 100%;
          }

          .details-panel {
            width: 100%;
            display: none;
          }

          .details-panel.show-mobile {
            display: block;
          }

          .list-panel.hide-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
