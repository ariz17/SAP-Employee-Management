import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="theme-toggle-btn"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="theme-icon sun-icon" />
      ) : (
        <Moon size={18} className="theme-icon moon-icon" />
      )}
    </button>
  );
}
