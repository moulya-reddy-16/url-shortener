import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api, BASE_URL, HOST_URL } from "../utils/api.js";
import { User, Mail, Key, Lock, X, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/GlassCard.jsx";
import Button from "../components/Button.jsx";

export default function Profile() {
  const { user, updateUserState } = useAuth();
  const toast = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  // Profile Image States
  const [profileImage, setProfileImage] = useState(
    user?.profileImage
      ? user.profileImage.startsWith("http") || user.profileImage.startsWith("blob:")
        ? user.profileImage
        : `${HOST_URL}${user.profileImage}`
      : ""
  );
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password Change Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleOpenModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setShowPasswordModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    const formData = new FormData();
    formData.append("profileImage", file);

    setImageUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/upload-profile-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      // Replace preview with permanent URL
      setProfileImage(`${HOST_URL}${data.profileImage}`);
      if (updateUserState) updateUserState(data.user);
      toast.success("Profile image updated!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image.");
      setProfileImage(
        user?.profileImage
          ? user.profileImage.startsWith("http") || user.profileImage.startsWith("blob:")
            ? user.profileImage
            : `${HOST_URL}${user.profileImage}`
          : ""
      ); // revert
    } finally {
      setImageUploading(false);
      // reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api("/auth/update-profile", {
        method: "PUT",
        body: {
          name,
          email,
        }
      });

      if (updateUserState) {
        updateUserState(res.user);
      } else {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      toast.success(res.message || "Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCurrentPasswordError("");
    setNewPasswordError("");
    
    if (newPassword === currentPassword) {
      setNewPasswordError("New password cannot be the same as current password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await api("/auth/change-password", {
        method: "PUT",
        body: {
          currentPassword,
          newPassword,
        }
      });

      toast.success("Password updated successfully!");
      
      // Reset password states and close modal
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      if (err.message === "Incorrect current password") {
        setCurrentPasswordError("Incorrect current password.");
      } else {
        toast.error(err.message || "Failed to change password.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full text-left">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight text-text-main">Account Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account information and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* Left Panel: Status Info */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard hoverGlow={false} className="p-6 text-center bg-glass-bg/30">
            {/* Avatar with upload overlay */}
            <div className="relative mx-auto w-20 h-20 mb-4 group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold uppercase">
                    {user?.name?.slice(0, 2) || "US"}
                  </div>
                )}
              </div>

              {/* Camera upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                title="Upload profile photo"
              >
                {imageUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <p className="text-[10px] text-text-muted mb-3">Click avatar to upload photo</p>
            <h2 className="text-lg font-bold text-text-main leading-none">{user?.name}</h2>
            <span className="text-xs text-text-muted uppercase tracking-widest font-semibold mt-1.5 block">
              {user?.role} Account
            </span>
          </GlassCard>
        </div>

        {/* Right Panel: Settings Form */}
        <div className="md:col-span-2">
          <GlassCard hoverGlow={true} className="p-6 sm:p-8 bg-glass-bg/30">
            <h3 className="text-lg font-bold text-text-main mb-6 border-b border-border-custom pb-4">
              Profile Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10 pr-4 text-sm text-text-main outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10 pr-4 text-sm text-text-main outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-custom">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenModal}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Change Password
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={loading}
                  loading={loading}
                  className="w-full sm:w-auto px-8 order-1 sm:order-2"
                >
                  Save Profile Updates
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md z-10"
            >
              <GlassCard hoverGlow={true} className="p-6 relative bg-bg-surface border-border-custom shadow-xl">
                {/* Close Button */}
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2.5 mb-5 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main leading-tight">Change Password</h3>
                    <p className="text-[11px] text-text-muted">Enter credentials to verify and update password</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 text-left">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                        <Lock className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (currentPasswordError) setCurrentPasswordError("");
                        }}
                        className={`block w-full rounded-xl border py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none transition-all ${
                          currentPasswordError 
                            ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
                            : "border-border-custom bg-bg-app/40 focus:border-primary/50 focus:bg-bg-app"
                        }`}
                      />
                    </div>
                    {currentPasswordError && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-in">
                        {currentPasswordError}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                        <Lock className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (newPasswordError) setNewPasswordError("");
                        }}
                        className={`block w-full rounded-xl border py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none transition-all ${
                          newPasswordError 
                            ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
                            : "border-border-custom bg-bg-app/40 focus:border-primary/50 focus:bg-bg-app"
                        }`}
                      />
                    </div>
                    {newPasswordError && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-in">
                        {newPasswordError}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                        <Lock className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (newPasswordError) setNewPasswordError("");
                        }}
                        className={`block w-full rounded-xl border py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none transition-all ${
                          newPasswordError 
                            ? "border-red-500/50 bg-red-500/5 focus:border-red-500" 
                            : "border-border-custom bg-bg-app/40 focus:border-primary/50 focus:bg-bg-app"
                        }`}
                      />
                    </div>
                    {newPasswordError && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1.5 ml-1 animate-slide-in">
                        {newPasswordError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-5 py-2.5 text-xs font-bold text-text-muted hover:text-text-main"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={passwordLoading}
                      loading={passwordLoading}
                      className="px-6 py-2.5"
                    >
                      Save Password
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
