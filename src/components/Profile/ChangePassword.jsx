import React, { useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      return setMessage("❌ Password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return setMessage("⚠️ You must be signed in to change your password.");
    }

    try {
      setLoading(true);
      await updatePassword(user, newPassword);
      setMessage("✅ Password successfully updated!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update password. Try signing out and back in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto mt-8 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h2>
      <form onSubmit={handleChange} className="space-y-4">
        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer select-none"
            title={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer select-none"
            title={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? "🙈" : "👁️"}
          </span>
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
