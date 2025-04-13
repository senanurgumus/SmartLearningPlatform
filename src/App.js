import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import ParentDashboard from "./pages/ParentDashboard.js";
import ModulePage from "./pages/ModulePage.js";
import Home from "./pages/Home.js";
import ExercisesPage from './pages/ExercisesPage.js';
import ActivitiesPage from './pages/ActivitiesPage.js';
import AchievementsPage from './pages/AchievementsPage.js';
import MathUnitListPage from './pages/MathUnitListPage.js';
import MathUnitQuizPage from './pages/MathUnitQuizPage.js';
import ScienceUnitListPage from "./pages/ScienceUnitListPage.js";
import ScienceUnitQuizPage from "./pages/ScienceUnitQuizPage.js";
import EnglishUnitListPage from "./pages/EnglishUnitListPage.js";
import EnglishUnitQuizPage from "./pages/EnglishUnitQuizPage.js";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/module/:moduleId" element={<ModulePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/module/:moduleId/exercises" element={<ExercisesPage />} />
        <Route path="/module/:moduleId/activities" element={<ActivitiesPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/module/math/quiz" element={<MathUnitListPage />} />
        <Route path="/module/math/quiz/:unitId" element={<MathUnitQuizPage />} />
        <Route path="/achievements/:moduleId" element={<AchievementsPage />} />
        <Route path="/module/science/quiz" element={<ScienceUnitListPage />} />
        <Route path="/module/science/quiz/:unitId" element={<ScienceUnitQuizPage />} />
        <Route path="/module/english/quiz" element={<EnglishUnitListPage />} />
        <Route path="/module/english/quiz/:unitId" element={<EnglishUnitQuizPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
