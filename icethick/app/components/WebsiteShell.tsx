'use client';

import { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

export default function WebsiteShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="site-page">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {children}
      <Footer />
    </div>
  );
}
