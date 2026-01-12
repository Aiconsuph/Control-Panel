import React, { useState } from "react";
import InquiryModal from "./InquiryModal";

export default function CategoryCard({ category }) {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const handleInquiry = (itemName) => {
    setSelectedItem(itemName);
    setOpen(true);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "15px",
        borderRadius: "5px",
      }}
    >
      {/* CATEGORY NAME (with inquire button) */}
      {category.name && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>{category.name}</h3>

          <button
            onClick={() => handleInquiry(category.name)}
            style={{
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            Inquire
          </button>
        </div>
      )}

      {/* LIST ITEMS (even if no category name) */}
      {Array.isArray(category.list) && category.list.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
          {category.list.map((item, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span>{item}</span>

              <button
                onClick={() => handleInquiry(item)}
                style={{
                  marginLeft: "20px",
                  padding: "5px 12px",
                  cursor: "pointer",
                }}
              >
                Inquire
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inquiry Modal */}
      {open && <InquiryModal item={selectedItem} close={() => setOpen(false)} />}
    </div>
  );
}
