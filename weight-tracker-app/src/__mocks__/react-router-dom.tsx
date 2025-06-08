// src/__mocks__/react-router-dom.tsx
import React from 'react';

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Routes = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Route = ({ element }: { element: React.ReactNode }) => <>{element}</>; {/* Using Fragment to ensure element is rendered */}
export const Link = ({ to, children }: { to: string, children: React.ReactNode }) => <a href={to}>{children}</a>;
// Add other exports from react-router-dom that your app uses, if any, e.g., useNavigate
export const useNavigate = () => jest.fn();
