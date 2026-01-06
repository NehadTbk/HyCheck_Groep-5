import React from "react";
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

function NotificationsModal({ isOpen, onClose, notifications = [] }) {
  const { t } = useTranslation();

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
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('notifications.minutesAgo')}`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${t('notifications.hoursAgo')}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${t('notifications.daysAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal - Centered */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="w-96 max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="text-[#5C2D5F]" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              {t('notifications.title')}
            </h2>
            {newNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {newNotifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bell size={48} className="mb-3 opacity-50" />
              <p className="text-center font-medium">{t('notifications.noAlerts')}</p>
            </div>
          ) : (
            <>
              {/* New Notifications */}
              {newNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">
                    {t('notifications.new')}
                  </h3>
                  {newNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-purple-50 border-l-4 border-[#5C2D5F] p-4 rounded-r-lg hover:bg-purple-100 transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 text-xs mb-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Old Notifications */}
              {oldNotifications.length > 0 && (
                <div className="space-y-3">
                  {newNotifications.length > 0 && (
                    <h3 className="text-sm font-semibold text-gray-600 uppercase pt-4">
                      {t('notifications.older')}
                    </h3>
                  )}
                  {oldNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg hover:bg-gray-100 transition cursor-pointer opacity-75"
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-700 text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 text-xs mb-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

export default NotificationsModal;
