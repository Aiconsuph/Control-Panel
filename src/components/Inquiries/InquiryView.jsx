import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function InquiryView({ inquiry, onBack }) {
  
  const replyWithGmail = async () => {
    // Open Gmail with prefilled message
    const subject = encodeURIComponent(`Reply to your inquiry about ${inquiry.product}`);
    const body = encodeURIComponent(
      `Hi ${inquiry.name},\n\nRegarding your inquiry:\n"${inquiry.message}"\n\n`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${inquiry.email}&su=${subject}&body=${body}`,
      "_blank"
    );

    // Mark as replied
    try {
      await updateDoc(doc(db, "inquiries", inquiry.id), {
        replied: true,
        repliedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to update replied status: ", err);
    }
  };

  return (
    <div className="inquiry-view">
      <button className="back-btn" onClick={onBack}>← Back</button>

      <h2 className="title">{inquiry.name}</h2>

      <div className="info-box">
        <p><strong>Email:</strong> {inquiry.email}</p>
        <p><strong>Product:</strong> {inquiry.product}</p>
        <p><strong>Message:</strong></p>
        <div className="msg-block">{inquiry.message}</div>
      </div>

      <button className="reply-btn" onClick={replyWithGmail}>
        Reply via Gmail
      </button>

      <style>{`
        .inquiry-view {
          background: #1e293b;
          padding: 20px;
          border-radius: 10px;
          color: #f9fafb;
        }
        .title {
          font-size: 1.6rem;
          color: #facc15;
          margin-top: 0;
        }
        .msg-block {
          background: #334155;
          padding: 12px;
          border-radius: 8px;
          margin-top: 5px;
        }
        .reply-btn {
          margin-top: 20px;
          padding: 12px 20px;
          background: #facc15;
          color: #0f172a;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .reply-btn:hover {
          background: #eab308;
        }
        .back-btn {
          display: none;
          margin-bottom: 15px;
          padding: 8px 14px;
          background: #334155;
          color: #f9fafb;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          .back-btn {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
