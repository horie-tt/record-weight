// src/components/InputScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import InputScreen from './InputScreen';

// Mock localStorage for the component
let store: { [key: string]: string } = {}; // Add type for store
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


describe('InputScreen Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders the main heading', () => {
    render(<InputScreen />);
    expect(screen.getByText(/体重等の入力 \(Input Weight, etc.\)/i)).toBeInTheDocument();
  });

  test('renders weight input field', () => {
    render(<InputScreen />);
    expect(screen.getByLabelText(/体重 \(Weight\) \(kg\):/i)).toBeInTheDocument();
  });

  test('renders BMI input field', () => {
    render(<InputScreen />);
    expect(screen.getByLabelText(/BMI:/i)).toBeInTheDocument();
  });

  test('renders Body Fat Percentage input field', () => {
    render(<InputScreen />);
    expect(screen.getByLabelText(/体脂肪率 \(Body Fat Percentage\) \(%\):/i)).toBeInTheDocument();
  });

  test('renders Muscle Mass input field', () => {
    render(<InputScreen />);
    expect(screen.getByLabelText(/筋肉量 \(Muscle Mass\) \(kg\):/i)).toBeInTheDocument();
  });

  test('renders Visceral Fat Level input field', () => {
    render(<InputScreen />);
    expect(screen.getByLabelText(/内臓脂肪量 \(Visceral Fat Level\):/i)).toBeInTheDocument();
  });

  test('renders the record button', () => {
    render(<InputScreen />);
    expect(screen.getByRole('button', { name: /記録 \(Record\)/i })).toBeInTheDocument();
  });
});
