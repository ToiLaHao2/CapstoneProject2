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
import MyTasks from "./components/dashboard/my_tasks_components/MyTasks";
import Notifications from "./components/notifications/Notifications";
import TaskDetail from "./components/tasks/task_detail/TaskDetail";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <ContextProvider>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Dashboard />
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
                                        <Dashboard />
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
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <Notifications />
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

                    <Route
                        path="/my-tasks"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <MyTasks />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/task/:taskId"
                        element={
                            <ProtectedRoute>
                                <div className="app">
                                    <Topbar />
                                    <div className="main-content">
                                        <Sidebar />
                                        <TaskDetail />
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
