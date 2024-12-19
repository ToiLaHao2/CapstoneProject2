// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Sidebar from './components/sidebar/Sidebar';
// import Topbar from './components/topbar/Topbar';
// import Dashboard from './components/dashboard/Dashboard';
// import Projects from './components/projects/Projects';
// import Calendar from './components/calendar/Calendar';
// import Tasks from './components/tasks/Tasks';

// import './App.css';
// import Chat from './components/chat/Chat';
// import LoginForm from './components/user/LoginForm';
// import SignupForm from './components/user/SignupForm';
// import ChangePasswordForm from './components/user/ChangePasswordForm';

// function App() {
//   return (
//     <Router>
//       <div className="app">
//         <Topbar />
//         <div className="main-content">
//           <Sidebar />
//           <Routes>
//           <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/projects" element={<Projects />} />
//             <Route path="/tasks" element={<Tasks />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/chat" element={<Chat />} />

//             <Route path='/login' element={<LoginForm />} />
//             <Route path='/signup' element={<SignupForm />} />
//             <Route path='/change-password' element={<ChangePasswordForm />} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import Dashboard from "./components/dashboard/Dashboard";
import Projects from "./components/projects/Projects";
import Calendar from "./components/calendar/Calendar";
import Tasks from "./components/tasks/Tasks";
import Chat from "./components/chat/Chat";
import LoginForm from "./components/user/LoginForm";
import SignupForm from "./components/user/SignupForm";
import ChangePasswordForm from "./components/user/ChangePasswordForm";

import "./App.css";
import ViewProfile from "./components/user/viewProfile/ViewProfile";
import ContextProvider from "./context/ContextProvider";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <ContextProvider>
            <Router>
                <Routes>
                    {/* Layout đầy đủ: Topbar và Sidebar */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Dashboard /> {/* Trang mặc định */}
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Dashboard /> {/* Trang mặc định */}
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Projects />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Tasks />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Calendar />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Chat />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/view-profile"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <ViewProfile />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route
                        path="/change-password"
                        element={<ChangePasswordForm />}
                    />
                </Routes>
            </Router>
        </ContextProvider>
    );
}

export default App;
