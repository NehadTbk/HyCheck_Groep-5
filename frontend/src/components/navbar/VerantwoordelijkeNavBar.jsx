import React from 'react';
import { useLocation } from 'react-router-dom';
import BaseNavBar from '../layout/BaseNavBar';
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function VerantwoordelijkeNavBar() {
  const location = useLocation();
  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

  const items = [
    {
      key: 'dashboard',
      label: t('navbar.dashboard'),
      href: '/verantwoordelijke/dashboard',
      active: location.pathname === '/verantwoordelijke/dashboard'
    },
    {
      key: 'boxen',
      label: t('navbar.boxen'),
      href: '/verantwoordelijke/boxen',
      active: location.pathname === '/verantwoordelijke/boxen'
    },
    {
      key: 'rapporten',
      label: t('navbar.rapporten'),
      href: '/verantwoordelijke/rapporten',
      active: location.pathname === '/verantwoordelijke/rapporten'
    },
    {
      key: 'personeel',
      label: t('navbar.personeel'),
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
