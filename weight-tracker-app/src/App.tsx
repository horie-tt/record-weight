// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import InputScreen from './components/InputScreen';
import DashboardScreen from './components/DashboardScreen';
import DataManagementScreen from './components/DataManagementScreen';
import './App.css';

function App(): JSX.Element { // Explicit return type
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">入力 (Input)</Link>
            </li>
            <li>
              <Link to="/dashboard">ダッシュボード (Dashboard)</Link>
            </li>
            <li>
              <Link to="/manage-data">データ管理 (Manage Data)</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/manage-data" element={<DataManagementScreen />} />
          <Route path="/" element={<InputScreen />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
