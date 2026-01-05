import React from 'react';
import { Link } from 'react-router-dom';
import { IoMdNotificationsOutline } from 'react-icons/io';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../i18n/useLanguage';

function BaseNavBar({
  items = [],
  showInstructions = false,
  showNotifications = true,
  activeColor = '#C1A9CF',
  activeTextColor = '#2C1E33',
  children
}) {
  const { language, setLanguage } = useLanguage();
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
            <button className="text-base text-gray-900 font-medium hover:opacity-80 transition">
              Instructies
            </button>
          )}

          {showNotifications && (
            <span className="text-gray-500 cursor-pointer hover:text-gray-700">
              <IoMdNotificationsOutline size={24} />
            </span>
          )}
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="default" />

          {children}
        </div>
      </div>
    </nav>
  );
}

export default BaseNavBar;
