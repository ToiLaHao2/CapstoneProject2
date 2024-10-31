// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Topbar from './components/topbar/Topbar';
import TaskBoard from './components/taskboard/Taskboard';
import TaskColumn from './components/taskcolum/TaskColumn';
import TaskCard from './components/taskcard/TaskCard';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Topbar />
        <div className="main-content">
          <Sidebar />
          <Routes>
            <Route path="/taskboard" element={<TaskBoard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
