import React from "react";

interface UserAvatarProps {
  username: string;
  avatarColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarColor = "#3b82f6",
  size = "md",
  className = "",
}) => {
  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: avatarColor }}
      title={username}
    >
      {initials}
    </div>
  );
};
