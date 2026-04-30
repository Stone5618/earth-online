import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, LogOut, Palette, AtSign, FileText } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UserAvatar } from "../UserAvatar";
import { useToast } from "./ToastNotification";

interface UserProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ open, onClose }) => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setSelectedColor(user.avatar_color);
    } else if (!isAuthenticated && open) {
      // If user logged out while panel is open, close it
      onClose();
    }
  }, [user, isAuthenticated, open, onClose]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { success, error } = await updateProfile({
        display_name: displayName || undefined,
        bio: bio || undefined,
        avatar_color: selectedColor,
      });
      if (success) {
        showToast("个人信息已更新", "success");
        onClose();
      } else {
        showToast(error || "更新失败", "error");
      }
    } catch {
      showToast("更新失败", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("已退出登录", "success");
      onClose();
    } catch {
      // Even if API fails, still try to log out locally
      onClose();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative glass-card w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-holo-blue" />
              <h2 className="text-2xl font-bold text-white font-orbitron">个人中心</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue"
              aria-label="关闭个人中心"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {user && (
            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <UserAvatar
                  username={user.display_name || user.username}
                  avatarColor={selectedColor}
                  size="xl"
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">
                    {user.display_name || user.username}
                  </h3>
                  <p className="text-white/60 text-sm">@{user.username}</p>
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-white/80 font-medium">
                  <Palette className="w-4 h-4" />
                  头像颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue ${
                        selectedColor === color
                          ? "ring-2 ring-white scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`选择颜色 ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/80 font-medium">
                  <AtSign className="w-4 h-4" />
                  昵称
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="输入昵称"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-holo-blue/50 focus:ring-1 focus:ring-holo-blue/50"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/80 font-medium">
                  <FileText className="w-4 h-4" />
                  个性签名
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="输入个性签名"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-holo-blue/50 focus:ring-1 focus:ring-holo-blue/50 resize-none"
                />
                <p className="text-white/40 text-xs text-right">{bio.length}/500</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 px-4 bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "保存中..." : "保存修改"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
