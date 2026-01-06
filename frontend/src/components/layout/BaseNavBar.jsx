import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdNotificationsOutline } from 'react-icons/io';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../i18n/useLanguage';
import NotificationsModal from '../notifications/NotificationsModal';

function BaseNavBar({
  items = [],
  showInstructions = false,
  showNotifications = true,
  activeColor = '#C1A9CF',
  activeTextColor = '#2C1E33',
  instructiesHref = '#',
  children
}) {
  const { language, setLanguage } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Get user from localStorage to filter notifications
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Load notifications - TODO: Replace with API call
  useEffect(() => {
    // Sample notifications - in production, fetch from backend
    const sampleNotifications = [
      {
        id: 1,
        title: "Nieuwe box toegewezen",
        message: "Box 5 is aan u toegewezen voor vandaag",
        date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        type: "info",
        read: false,
        role: "assistant"
      },
      {
        id: 2,
        title: "Taak voltooid",
        message: "Box 3 is succesvol schoongemaakt",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        type: "success",
        read: false,
        role: "assistant"
      },
      {
        id: 3,
        title: "Rapport beschikbaar",
        message: "Het maandrapport van november is nu beschikbaar",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        type: "info",
        read: true,
        role: "responsible"
      },
      {
        id: 4,
        title: "Nieuw personeelslid",
        message: "Jan Janssen is toegevoegd aan het systeem",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        type: "success",
        read: true,
        role: "admin"
      }
    ];

    // Filter notifications by user role
    const userNotifications = sampleNotifications.filter(
      n => n.role === user?.role || n.role === "all"
    );
    setNotifications(userNotifications);
  }, [user?.role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getActiveStyles = (isActive) => {
    if (isActive) {
      return 'font-semibold text-base py-2 px-4 rounded-full transition-all';
    }
    return 'text-gray-500 text-base py-2 px-4 hover:text-black transition-all';
  };

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
              style={item.active ? {
                backgroundColor: activeColor,
                color: activeTextColor
              } : {}}
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
              Instructies
            </Link>
          )}

          {showNotifications && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-gray-500 cursor-pointer hover:text-gray-700 relative"
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
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="default" />

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
