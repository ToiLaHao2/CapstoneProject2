import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Topbar from './components/topbar/Topbar';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import Calendar from './components/calendar/Calendar';
import Tasks from './components/tasks/Tasks';

import './App.css';
import Chat from './components/chat/Chat';

function App() {
  return (
    <Router>
      <div className="app">
        <Topbar />
        <div className="main-content">
          <Sidebar />
          <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
