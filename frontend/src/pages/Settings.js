import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import UserAvatar from "../components/UserAvatar";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBell,
  FaComments,
  FaHeart,
  FaNewspaper,
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";
import API_URL from "../config";
import { getPasswordHint, passwordsMatch } from "../utils/validation";

const inputClass =
  "w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all";

const formatAcademicLevel = (level) => {
  if (level === 600) return "Graduate";
  if (level) return `${level} Level`;
  return "—";
};

const SettingSection = ({ title, description, icon, children, className = "" }) => (
  <section
    className={`bg-white rounded-xl shadow-lg border-2 border-neutral-200 p-6 mb-6 ${className}`}
  >
    <div className="flex items-start gap-3 mb-5">
      {icon && <div className="text-primary-600 mt-1 text-xl">{icon}</div>}
      <div>
        <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
        {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Settings = () => {
  const { user, dispatch } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [contact, setContact] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [preferences, setPreferences] = useState({
    friendRequests: true,
    messages: true,
    comments: true,
    likes: true,
    newPosts: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const userId = user?._id || user?.userId;

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => {
    if (!profileImageFile) {
      setImagePreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(profileImageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  const fetchSettings = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) throw new Error("Failed to load settings");

      const data = await response.json();
      setProfile(data);
      setContact(data.contact?.toString() || "");
      setAcademicLevel(
        data.academicLevel === 600 ? "graduate" : data.academicLevel?.toString() || ""
      );
      setIsEmailVerified(data.isEmailVerified !== false);
      if (data.notificationPreferences) {
        setPreferences(data.notificationPreferences);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const syncAuthUser = (updates) => {
    const next = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(next));
    dispatch({ type: "UPDATE_PROFILE", payload: updates });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.token) return;

    setSavingProfile(true);
    try {
      const formData = new FormData();
      if (contact) formData.append("contact", contact);
      if (academicLevel) formData.append("academicLevel", academicLevel);
      if (profileImageFile) formData.append("profileImage", profileImageFile);

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || err.message || "Failed to update profile");
      }

      const updated = await response.json();
      setProfile(updated);
      setProfileImageFile(null);
      syncAuthUser({
        profileImage: updated.profileImage,
        name: updated.name,
        department: updated.department,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user?.token) return;

    setSavingNotifications(true);
    try {
      const response = await fetch(`${API_URL}/api/users/me/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || err.message || "Failed to save preferences");
      }

      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error(error.message || "Failed to save notification preferences");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.token) return;
    setResendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/api/users/resend-verification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not send verification email");
        return;
      }
      toast.success(data.message || "Verification email sent");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const hint = getPasswordHint(newPassword);
    if (hint) {
      toast.error(hint);
      return;
    }
    if (!passwordsMatch(newPassword, confirmPassword)) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch(`${API_URL}/api/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(data.message || "Password updated");
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const notificationOptions = [
    {
      key: "friendRequests",
      label: "Friend requests",
      description: "When someone sends you a connection request",
      icon: <FaBell />,
    },
    {
      key: "messages",
      label: "Messages",
      description: "When you receive a new direct message",
      icon: <FaComments />,
    },
    {
      key: "comments",
      label: "Comments",
      description: "When someone comments on your posts",
      icon: <FaComments />,
    },
    {
      key: "likes",
      label: "Likes",
      description: "When someone likes your posts or comments",
      icon: <FaHeart />,
    },
    {
      key: "newPosts",
      label: "New posts",
      description: "New posts from coursemates in your department",
      icon: <FaNewspaper />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
        <Header />
        <NavbarMP />
        <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[720px] pb-8 mt-6">
          <p className="text-neutral-500">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[720px] pb-12 mt-6 sm:mt-8">
        <ToastContainer />
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-neutral-600 mb-8">Manage your account, profile, and preferences</p>

        {!isEmailVerified && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
              <FaEnvelope /> Verify your email
            </h2>
            <p className="text-sm text-amber-800 mb-4">
              We sent a link to <strong>{profile?.email || user?.email}</strong>. Open it to
              confirm your account.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
            >
              {resendingEmail ? "Sending…" : "Resend verification email"}
            </button>
          </div>
        )}

        <SettingSection
          title="Account"
          description="Your Sturum identity (set at signup)"
          icon={<FaUser />}
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="New profile preview"
                className="w-[72px] h-[72px] rounded-full object-cover border-2 border-primary-400 shrink-0"
              />
            ) : (
              <UserAvatar
                name={profile?.name}
                profileImage={profile?.profileImage}
                token={user?.token}
                size={72}
                className="border-2 border-primary-300 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-bold text-lg text-neutral-800 truncate">{profile?.name}</p>
              <p className="text-sm text-neutral-600 truncate">{profile?.email}</p>
              {isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 mt-1">
                  <FaCheckCircle /> Email verified
                </span>
              )}
            </div>
          </div>

          <dl className="grid gap-3 text-sm mb-6">
            <div className="flex justify-between gap-4 py-2 border-b border-neutral-100">
              <dt className="text-neutral-500">Department</dt>
              <dd className="font-medium text-neutral-800 text-right">{profile?.department}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-neutral-100">
              <dt className="text-neutral-500">Academic level</dt>
              <dd className="font-medium text-neutral-800 text-right">
                {formatAcademicLevel(profile?.academicLevel)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-neutral-500">Member since</dt>
              <dd className="font-medium text-neutral-800 text-right">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>

          {userId && (
            <Link
              to={`/profile/${userId}`}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              View public profile →
            </Link>
          )}
        </SettingSection>

        <SettingSection
          title="Profile"
          description="Update contact info and profile photo"
          icon={<FaUser />}
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="contact" className="block text-sm font-semibold text-neutral-700 mb-2">
                Contact number
              </label>
              <input
                id="contact"
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
                placeholder="e.g. 08012345678"
              />
            </div>

            <div>
              <label
                htmlFor="academicLevel"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Academic level
              </label>
              <select
                id="academicLevel"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className={inputClass}
              >
                <option value="">Select level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="profileImage"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Profile photo
              </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImageFile(e.target.files[0] || null)}
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700`}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold rounded-lg"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>
        </SettingSection>

        <SettingSection
          title="Security"
          description="Change your password"
          icon={<FaLock />}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
              />
              <p className="text-xs text-neutral-500 mt-1">
                At least 8 characters with uppercase, lowercase, number, and symbol
              </p>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold rounded-lg"
            >
              {savingPassword ? "Updating…" : "Change password"}
            </button>
          </form>
        </SettingSection>

        <SettingSection
          title="Notifications"
          description="Choose what you want to be notified about"
          icon={<FaBell />}
        >
          <div className="space-y-4">
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-start justify-between p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-300 transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-primary-600 mt-1">{option.icon}</div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{option.label}</h3>
                    <p className="text-sm text-neutral-600">{option.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences[option.key]}
                    onChange={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        [option.key]: !prev[option.key],
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                </label>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSaveNotifications}
            disabled={savingNotifications}
            className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold rounded-lg"
          >
            {savingNotifications ? "Saving…" : "Save notifications"}
          </button>
        </SettingSection>

        <SettingSection title="Session" description="Sign out of Sturum on this device">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Log out
          </button>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;
