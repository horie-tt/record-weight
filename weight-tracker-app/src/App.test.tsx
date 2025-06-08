// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import App from './App';

// Mock localStorage as it's a dependency for child components
let store: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => {
    store[key] = value.toString();
  },
  clear: (): void => {
    store = {};
  },
  removeItem: (key: string): void => {
    delete store[key];
  }
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });


describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test, as App's children might use it
    window.localStorage.clear();
  });

  test('renders Input link', () => {
    render(
      <Router>
        <App />
      </Router>
    );
    // Check for one of the navigation links
    const inputLink = screen.getByRole('link', { name: /入力 \(Input\)/i });
    expect(inputLink).toBeInTheDocument();
  });

  test('renders Dashboard link', () => {
    render(
      <Router>
        <App />
      </Router>
    );
    const dashboardLink = screen.getByRole('link', { name: /ダッシュボード \(Dashboard\)/i });
    expect(dashboardLink).toBeInTheDocument();
  });

  test('renders Manage Data link', () => {
    render(
      <Router>
        <App />
      </Router>
    );
    const manageDataLink = screen.getByRole('link', { name: /データ管理 \(Manage Data\)/i });
    expect(manageDataLink).toBeInTheDocument();
  });
});
