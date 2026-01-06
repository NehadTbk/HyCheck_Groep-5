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
    },
    {
      key: 'monthly-overview',
      label: 'Maandoverzicht',
      href: '/afdelingshoofd/overzicht-maanden',
      active: location.pathname === '/afdelingshoofd/overzicht-maanden'
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

export default AfdelingshoofdNavBar;
