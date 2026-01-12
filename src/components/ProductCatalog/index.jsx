import React, { useState, useMemo } from "react";
import catalogData from "../../catalogData.json";
import CategoryCard from "./CategoryCard";

export default function CatalogIndex() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const sections = catalogData.catalogData || catalogData;

  if (!sections || sections.length === 0)
    return <p>No catalog data available.</p>;

  // Names for tabs (7 total including All Products)
  const sectionNames = [
    "All Products",
    "Chemical Materials",
    "Electrical Materials",
    "Heavy Equipments",
    "Aggregates",
    "Electrical Products",
    "Wellness Products",
  ];

  // Ensure the sections count matches
  const safeSections = [...sections];

  // Generate ALL items for TAB 0
  const allItems = useMemo(() => {
    let items = [];
    safeSections.forEach((group) => {
      group.forEach((cat) => {
        if (cat && cat.list && Array.isArray(cat.list)) {
          items.push(cat);
        }
      });
    });
    return items;
  }, [safeSections]);

  // Decide which section to show
  const currentSection =
    activeTab === 0 ? allItems : safeSections[activeTab - 1];

  // Filter items by search
  const filtered = currentSection.filter((cat) => {
    if (!cat || !cat.name) return false;

    const nameMatch = cat.name.toLowerCase().includes(search.toLowerCase());
    const listMatch =
      Array.isArray(cat.list) &&
      cat.list.some((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );

    return nameMatch || listMatch;
  });

  return (
    <div style={{ padding: "10px" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
        {sectionNames.map((name, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: "8px 14px",
              cursor: "pointer",
              background: activeTab === idx ? "#333" : "#eee",
              color: activeTab === idx ? "white" : "black",
              border: "1px solid #aaa",
              borderRadius: "5px",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />

      {/* Product Categories */}
      <div>
        {filtered.length > 0 ? (
          filtered.map((cat, idx) => (
            <CategoryCard key={idx} category={cat} />
          ))
        ) : (
          <p>No matching products found.</p>
        )}
      </div>
    </div>
  );
}
