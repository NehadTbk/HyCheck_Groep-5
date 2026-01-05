import React from 'react';
import { useLocation } from 'react-router-dom';
import BaseNavBar from '../layout/BaseNavBar';

function AfdelingshoofdNavBar() {
  const location = useLocation();

  const items = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/afdelingshoofd/dashboard',
      active: location.pathname === '/afdelingshoofd/dashboard'
    },
    {
      key: 'personeel',
      label: 'Mijn Personeel',
      href: '/afdelingshoofd/mijn-personeel',
      active: location.pathname === '/afdelingshoofd/mijn-personeel'
    }
  ];

  return (
    <BaseNavBar
      items={items}
      showInstructions={false}
      showNotifications={true}
    />
  );
}

export default AfdelingshoofdNavBar;
