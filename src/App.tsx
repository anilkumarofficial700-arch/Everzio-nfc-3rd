/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PublicBusinessCard } from './components/PublicBusinessCard';
import { PublicDigitalMenu } from './components/PublicDigitalMenu';
import { OwnerMenuDashboard } from './components/OwnerMenuDashboard';
import { AdminView } from './components/AdminView';
import { HomeSimulator } from './components/HomeSimulator';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route 1: Dynamic Public Digital Menu (/menu/:slug or /m/:slug)
  const menuMatch = currentPath.match(/^\/(?:menu|m)\/([^/]+)/i);
  if (menuMatch) {
    const slug = decodeURIComponent(menuMatch[1]);
    return (
      <PublicDigitalMenu
        slug={slug}
        onBack={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigateTo('/');
          }
        }}
      />
    );
  }

  // Route 2: Business Owner Menu Portal (/menu-login or /owner)
  if (currentPath.startsWith('/menu-login') || currentPath.startsWith('/owner')) {
    return (
      <OwnerMenuDashboard
        onNavigateHome={() => navigateTo('/')}
        onNavigateMenu={(slug) => navigateTo(`/menu/${slug}`)}
      />
    );
  }

  // Route 3: Dynamic Public Business Landing Page (/c/:cardCode)
  const cardMatch = currentPath.match(/^\/c\/([^/]+)/i);
  if (cardMatch) {
    const cardCode = decodeURIComponent(cardMatch[1]).toUpperCase();
    return (
      <PublicBusinessCard
        cardCode={cardCode}
        onNavigateMenu={(slug) => navigateTo(`/menu/${slug}`)}
      />
    );
  }

  // Route 4: Admin Control Panel (/admin)
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminView
        onNavigateHome={() => navigateTo('/')}
        onNavigateCard={(code) => navigateTo(`/c/${code}`)}
        onNavigateOwnerLogin={() => navigateTo('/menu-login')}
        onNavigateMenu={(slug) => navigateTo(`/menu/${slug}`)}
      />
    );
  }

  // Route 5: Home & NFC Simulator Portal (/)
  return (
    <HomeSimulator
      onOpenCard={(code) => navigateTo(`/c/${code}`)}
      onOpenAdmin={() => navigateTo('/admin')}
      onOpenOwnerLogin={() => navigateTo('/menu-login')}
    />
  );
}
