// src/components/DataManagementScreen.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import DataManagementScreen from './DataManagementScreen';
import { MeasurementEntry } from '../types'; // Import MeasurementEntry

// Mock localStorage
let store: { [key: string]: string } = {}; // Add type for store
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => {
    store[key] = value.toString();
  },
  clear: (): void => {
    store = {};
  },
  removeItem: (key: string): void => { // Added removeItem for completeness, though not used by this component's tests
    delete store[key];
  }
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });

describe('DataManagementScreen Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders "No recorded data" when localStorage is empty', () => {
    render(<DataManagementScreen />);
    expect(screen.getByText(/記録されたデータはありません。\(No recorded data.\)/i)).toBeInTheDocument();
  });

  test('displays formatted data from localStorage', () => {
    const testTimestamp = '2023-10-26T10:30:00.000Z';
    const mockData: MeasurementEntry[] = [ // Use MeasurementEntry type
      {
        id: 1,
        timestamp: testTimestamp,
        weight: 75.5,
        bmi: 22.1,
        bodyFat: 15.2,
        muscleMass: 55.3,
        visceralFat: 8.0
      },
    ];
    window.localStorage.setItem('weightTrackerData', JSON.stringify(mockData));

    render(<DataManagementScreen />);

    expect(screen.getByText(/75\.50 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/22\.1/i)).toBeInTheDocument(); // BMI
    expect(screen.getByText(/15\.2 %/i)).toBeInTheDocument(); // Body Fat
    expect(screen.getByText(/55\.3 kg/i)).toBeInTheDocument(); // Muscle Mass
    expect(screen.getByText(/8\.0/i)).toBeInTheDocument(); // Visceral Fat

    const dateRegex = /2023\/10\/26\s*10:30/;
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });
});
