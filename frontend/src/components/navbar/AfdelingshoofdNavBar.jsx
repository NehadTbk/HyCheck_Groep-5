import React from 'react';
import { useLocation } from 'react-router-dom';
import BaseNavBar from '../layout/BaseNavBar';
import { useTranslation } from '../../i18n/useTranslation';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import { useLanguage } from '../../i18n/useLanguage';


function AfdelingshoofdNavBar() {
  const location = useLocation();
  const { t } = useTranslation();

  const items = [
    {
      key: 'dashboard',
      label: t('navbar.dashboard'),
      href: '/afdelingshoofd/dashboard',
      active: location.pathname === '/afdelingshoofd/dashboard'
    },
    {
      key: 'personeel',
      label: t('navbar.mijnPersoneel'),
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
      instructiesHref="/instructies"
    />
  );
}

export default AfdelingshoofdNavBar;
