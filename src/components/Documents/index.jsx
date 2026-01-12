import { useState, useEffect } from "react";
import { db } from "../../firebase/firestore";
import { collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";

export default function Documents({ userRole }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [embed, setEmbed] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    // Reload FB embeds whenever documents change
    if (window.FB) window.FB.XFBML.parse();
  }, [documents]);

  const loadDocuments = async () => {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDocuments(data);
  };

  const handleAdd = async () => {
    if (!title || (!url && !embed)) {
      alert("Please enter a title and either a URL or embed code.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "documents"), {
        title,
        url: url || "",
        embedCode: embed || "",
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setUrl("");
      setEmbed("");
      loadDocuments();
    } catch (err) {
      alert("Error adding document: " + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "documents", id));
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="documents-page">
      <div className="box">
        <h2>Product Facebook Posts</h2>
        <p>Add a title and FB link or embed code to display below</p>

        {userRole !== "client" && (
          <div className="form">
            <input
              type="text"
              placeholder="Post Title (ex. New Promo)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Facebook Post URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <textarea
              placeholder="Paste Facebook Embed Code Here"
              rows={4}
              value={embed}
              onChange={(e) => setEmbed(e.target.value)}
            />
            <button onClick={handleAdd} disabled={loading}>
              {loading ? "Saving..." : "Add Post"}
            </button>
          </div>
        )}

        <h3>Saved Posts</h3>
        <div className="list">
          {documents.length === 0 && <p style={{ color: "#9ca3af" }}>No posts added yet.</p>}

          {documents.map((item) => (
            <div className="post-box" key={item.id}>
              <div className="header">
                <strong>{item.title}</strong>
                {userRole !== "client" && (
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                )}
              </div>

              {/* Show URL if available */}
              {item.url && (
                <p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View Post
                  </a>
                </p>
              )}

              {/* Show Embed if available */}
              {item.embedCode && (
                <div
                  className="embed-wrapper"
                  dangerouslySetInnerHTML={{ __html: item.embedCode }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Facebook SDK */}
      <div id="fb-root"></div>
      <script
        async
        defer
        crossOrigin="anonymous"
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0"
      ></script>

      <style jsx>{`
        .documents-page {
          padding: 30px;
          color: #e5e7eb;
          font-family: "Inter", sans-serif;
        }
        .box {
          max-width: 800px;
          margin: auto;
          background: rgba(31, 41, 55, 0.6);
          padding: 25px;
          border-radius: 12px;
        }
        h2 {
          font-size: 1.6rem;
          margin-bottom: 10px;
          color: #fff;
        }
        h3 {
          margin-top: 35px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          background: #1f2937;
          color: #fff;
          border: 1px solid #374151;
          border-radius: 8px;
          box-sizing: border-box;
        }
        button {
          padding: 10px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover {
          background: #059669;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .post-box {
          background: #111827;
          padding: 15px;
          border-radius: 8px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .delete-btn {
          background: #ef4444;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .delete-btn:hover {
          background: #dc2626;
        }
        .embed-wrapper {
          width: 100%;
          margin-top: 10px;
        }
        .embed-wrapper iframe,
        .embed-wrapper > * {
          width: 100% !important;
          display: block;
        }
        a {
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
