import React from 'react';
import { useLocation } from 'react-router-dom';
import BaseNavBar from '../layout/BaseNavBar';

function VerantwoordelijkeNavBar() {
  const location = useLocation();

  const items = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/verantwoordelijke/dashboard',
      active: location.pathname === '/verantwoordelijke/dashboard'
    },
    {
      key: 'boxen',
      label: 'Mijn Boxen',
      href: '/verantwoordelijke/boxen',
      active: location.pathname === '/verantwoordelijke/boxen'
    },
    {
      key: 'rapporten',
      label: 'Rapporten',
      href: '/verantwoordelijke/rapporten',
      active: location.pathname === '/verantwoordelijke/rapporten'
    },
    {
      key: 'personeel',
      label: 'Mijn Personeel',
      href: '/verantwoordelijke/personeel',
      active: location.pathname === '/verantwoordelijke/personeel'
    }
  ];

  return (
    <BaseNavBar
      items={items}
      showInstructions={true}
      showNotifications={true}
      activeColor="#C1A9CF"
      activeTextColor="#2C1E33"
      instructiesHref="/instructies"
    />
  );
}

export default VerantwoordelijkeNavBar;
