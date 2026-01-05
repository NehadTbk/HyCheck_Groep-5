import React from 'react';
import { useLocation } from 'react-router-dom';
import BaseNavBar from '../layout/BaseNavBar';

function AssistentNavBar() {
  const location = useLocation();

  const items = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/assistant/dashboard',
      active: location.pathname === '/assistant/dashboard'
    },
    {
      key: 'boxes',
      label: 'Mijn Boxen',
      href: '/assistant/mijn-boxen',
      active: location.pathname === '/assistant/mijn-boxen'
    },
    {
      key: 'history',
      label: 'Historiek',
      href: '/assistant/historiek',
      active: location.pathname === '/assistant/historiek'
    }
  ];

  return (
    <BaseNavBar
      items={items}
      showInstructions={true}
      showNotifications={true}
      activeColor="#C1A9CF"
      activeTextColor="#2C1E33"
    />
  );
}

export default AssistentNavBar;
