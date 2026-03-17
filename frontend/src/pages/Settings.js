import React, { useEffect, useState } from "react";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBell, FaComments, FaHeart, FaThumbsUp, FaNewspaper } from "react-icons/fa";

const Settings = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    friendRequests: true,
    messages: true,
    comments: true,
    likes: true,
    newPosts: true,
  });

  useEffect(() => {
    fetchNotificationPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotificationPreferences = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch("http://localhost:4000/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notification preferences");
      }

      const userData = await response.json();
      if (userData.notificationPreferences) {
        setPreferences(userData.notificationPreferences);
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user?.token) {
      toast.error("User is not authenticated");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:4000/api/users/me/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(preferences),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. Please check the server logs.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.message || "Failed to save notification preferences");
      }

      const data = await response.json();
      toast.success(data.message || "Notification preferences saved successfully!");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error(error.message || "Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: "friendRequests",
      label: "Friend Requests",
      description: "Get notified when someone sends you a friend request",
      icon: <FaBell className="text-xl" />,
    },
    {
      key: "messages",
      label: "Messages",
      description: "Get notified when you receive a new message",
      icon: <FaComments className="text-xl" />,
    },
    {
      key: "comments",
      label: "Comments",
      description: "Get notified when someone comments on your posts",
      icon: <FaComments className="text-xl" />,
    },
    {
      key: "likes",
      label: "Likes",
      description: "Get notified when someone likes your posts",
      icon: <FaHeart className="text-xl" />,
    },
    {
      key: "newPosts",
      label: "New Posts",
      description: "Get notified about new posts in your department",
      icon: <FaNewspaper className="text-xl" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
        <Header />
        <NavbarMP />
        <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8 mt-6 sm:mt-8 md:mt-10">
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8 mt-6 sm:mt-8 md:mt-10">
        <ToastContainer />
        <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Settings
        </h1>

        <div className="bg-white rounded-xl shadow-lg border-2 border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <FaBell className="text-primary-600" />
            Notification Preferences
          </h2>
          <p className="text-neutral-600 mb-6">
            Choose what notifications you want to receive
          </p>

          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-start justify-between p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-300 transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-primary-600 mt-1">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      {option.label}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {option.description}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences[option.key]}
                    onChange={() => handleToggle(option.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
