import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../../i18n/useLanguage";
import NotificationsModal from "../notifications/NotificationsModal";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function BaseNavBar({
  items = [],
  showInstructions = false,
  showNotifications = true,
  activeColor = "#C1A9CF",
  activeTextColor = "#2C1E33",
  instructiesHref = "#",
  children,
}) {
  const { language, setLanguage } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { t } = useTranslation();

  // Optional: keep reading user from localStorage if you use it elsewhere
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [token] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications?limit=30`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Notifications fetch failed:", res.status);
          setNotifications([]);
          return;
        }

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Notifications fetch error:", err);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getActiveStyles = (isActive) => {
    if (isActive) {
      return "font-semibold text-base py-2 px-4 rounded-full transition-all";
    }
    return "text-gray-500 text-base py-2 px-4 hover:text-black transition-all";
  };

  const openNotifications = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    // If opening modal: mark as read + refetch so badge updates
    if (nextOpen && token) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Mark read-all error:", err);
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    }
  };
  if (!token || !user) {
    return null;
  }
  return (
    <nav className="bg-white py-3 shadow-sm rounded-3xl mt-4 mb-6">
      <div className="w-full mx-auto px-4 flex items-center justify-between">
        {/* Left: Navigation Items */}
        <div className="flex gap-4">
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={getActiveStyles(item.active)}
              style={
                item.active
                  ? {
                    backgroundColor: activeColor,
                    color: activeTextColor,
                  }
                  : {}
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Utilities */}
        <div className="flex items-center space-x-4">
          {showInstructions && (
            <Link
              to={instructiesHref}
              className="text-base text-gray-900 font-medium hover:opacity-80 transition"
            >
              {t("navbar.instructions")}
            </Link>
          )}

          {showNotifications && (
            <div className="relative">
              <button
                onClick={openNotifications}
                className="text-gray-500 cursor-pointer hover:text-gray-700 relative"
                title="Notificaties"
                aria-label="Notificaties"
                type="button"
              >
                <IoMdNotificationsOutline size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}

          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
            variant="default"
          />

          {children}
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />
    </nav>
  );
}

export default BaseNavBar;
