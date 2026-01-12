import React, { useState, useRef, useEffect } from "react";
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

function NotificationsModal({ isOpen, onClose, notifications = [] }) {
  const { t } = useTranslation();
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 192, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPosition({ x: window.innerWidth / 2 - 192, y: 100 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  if (!isOpen) return null;

  const newNotifications = notifications.filter(n => !n.read);
  const oldNotifications = notifications.filter(n => n.read);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-600" size={20} />;
      case "warning":
        return <AlertCircle className="text-orange-600" size={20} />;
      case "error":
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins} ${t("notifications.minutesAgo")}`;
    if (hours < 24) return `${hours} ${t("notifications.hoursAgo")}`;
    if (days < 7) return `${days} ${t("notifications.daysAgo")}`;
    return date.toLocaleDateString();
  };

  const parseParams = (message) => {
    try {
      return typeof message === "string" ? JSON.parse(message) : {};
    } catch {
      return {};
    }
  };

  const renderNotificationText = (notification) => {
    const params = parseParams(notification.message);

    return {
      title: t(notification.title, params),
      body: t("notifications.db.missingBoxMessage", params)
    };
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={modalRef}
        className="fixed w-96 max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className="flex items-center justify-between p-4 border-b cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Bell className="text-[#5C2D5F]" size={24} />
            <h2 className="text-xl font-bold">{t("notifications.title")}</h2>
            {newNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {newNotifications.length}
              </span>
            )}
          </div>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400">{t("notifications.noAlerts")}</p>
          ) : (
            [...newNotifications, ...oldNotifications].map((notification) => {
              const { title, body } = renderNotificationText(notification);

              return (
                <div
                  key={notification.id}
                  className="bg-purple-50 border-l-4 border-[#5C2D5F] p-4 rounded"
                >
                  <div className="flex gap-3">
                    {getIcon(notification.type)}
                    <div>
                      <h4 className="font-bold text-sm">{title}</h4>
                      <p className="text-xs text-gray-600">{body}</p>
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationsModal;
