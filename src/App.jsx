import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider, useMockData } from './context/MockDataContext.jsx';
import { Layout } from './layouts/BaseLayout.jsx';

// Pages placeholders
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { StudentDashboard, SubmitDocument } from './pages/Student.jsx';
import { VerificatorDashboard, ManageExaminers } from './pages/Verificator.jsx';
import { SupervisorDashboard, ScheduleDefense } from './pages/Supervisor.jsx';

const AppRoutes = () => {
  const { currentUser } = useMockData();

  return (
    <Routes>
      <Route path="/" element={
        currentUser ? <Navigate to={`/${currentUser.role}`} /> : <Navigate to="/login" />
      } />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route element={<Layout requiredRole="student" />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/submit" element={<SubmitDocument />} />
      </Route>

      {/* Verificator Routes */}
      <Route element={<Layout requiredRole="verificator" />}>
        <Route path="/verificator" element={<VerificatorDashboard />} />
        <Route path="/verificator/examiners" element={<ManageExaminers />} />
      </Route>

      {/* Supervisor Routes */}
      <Route element={<Layout requiredRole="supervisor" />}>
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/supervisor/schedule" element={<ScheduleDefense />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <MockDataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </MockDataProvider>
  );
}

export default App;
