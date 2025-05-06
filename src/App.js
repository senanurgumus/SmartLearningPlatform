import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './components/Navbar.js';  // Navbar'ı import et
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
import ShapeDragActivity from './pages/ShapeDragActivity.js';
import PuzzleActivity from './pages/PuzzleActivity.js';
import MatchSumActivity from './pages/MatchSumActivity.js';
import ColorMixingLab from "./pages/ColorMixingLab.js";
import GrowPlantActivity from './pages/GrowPlantActivity.js';
import StatesOfMatterLab from './pages/StatesOfMatterLab.js';
import WordPuzzleActivity from './pages/WordPuzzleActivity.js';
import WordFreezeActivity from './pages/WordFreezeActivity.js';
import PhonicPopActivity from './pages/PhonicsPopActivity.js';
import ScienceUnitListPage from "./pages/ScienceUnitListPage.js";
import ScienceUnitQuizPage from "./pages/ScienceUnitQuizPage.js";
import EnglishUnitListPage from "./pages/EnglishUnitListPage.js";
import EnglishUnitQuizPage from "./pages/EnglishUnitQuizPage.js";
import EnglishExercisesPage from './pages/EnglishExercisesPage.js'; 
import AudioExercisePage from "./pages/AudioExercisePage.js";
import WordMatchExercisePage from './pages/WordMatchExercisePage.js';
import WordSortingPage from "./pages/WordSortingPage.js";
import MathDiceGamePage from './pages/MathDiceGamePage.js';
import MathExercisesPage from './pages/MathExercisesPage.js';
import BarGraphExercisePage from './pages/BarGraphExercisePage.js';
import EvenOrOddPage from './pages/EvenOrOddPage.js';
import ScienceExercisesPage from './pages/ScienceExercisesPage.js';
import ScienceWeatherChallengePage from './pages/ScienceWeatherChallengePage.js'; 
import ScienceFloatSinkGamePage from './pages/ScienceFloatSinkGamePage.js';
import ScienceMagnetGamePage from './pages/ScienceMagnetGamePage.js';
import DrawPage from './pages/DrawPage.js';
import PaintGalleryPage from './pages/PaintGalleryPage.js';
import PaintEditorPage from './pages/PaintEditorPage.js';
import AboutPage from './pages/AboutPage.js';
import ResetPassword from './pages/ResetPassword.js';
import Profile from './pages/Profile.js'; // dosya yolu doğruysa
import BalloonGame from './pages/BalloonGame.js'

// Component for rendering Navbar conditionally
function App() {
  const location = useLocation(); // useLocation hook to check the current route

  // Conditionally render Navbar, it will not show on /login and /register routes
  const showNavbar = location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/";

  return (
    <div>
      {showNavbar && <Navbar />} {/* Only show the Navbar if we're not on /login or /register */}



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
        {/* Correct routes for activities */}
        <Route path="/module/:moduleId/activities/puzzle" element={<PuzzleActivity />} />
        <Route path="/module/:moduleId/activities/shape-drag" element={<ShapeDragActivity />} />
        <Route path="/module/:moduleId/activities/match" element={<MatchSumActivity />} />
        <Route path="/module/:moduleId/activities/color-mixing" element={<ColorMixingLab />} />
        <Route path="/module/:moduleId/activities/plant-growth" element={<GrowPlantActivity />} />
        <Route path="/module/:moduleId/activities/matter-lab" element={<StatesOfMatterLab />} />
        <Route path="/module/:moduleId/activities/word-puzzle" element={<WordPuzzleActivity />} />
        <Route path="/module/:moduleId/activities/word-freeze" element={<WordFreezeActivity />} />
        <Route path="/module/:moduleId/activities/phonic-pop" element={<PhonicPopActivity />} />
        <Route path="/achievements/:moduleId" element={<AchievementsPage />} />
        <Route path="/module/science/quiz" element={<ScienceUnitListPage />} />
        <Route path="/module/science/quiz/:unitId" element={<ScienceUnitQuizPage />} />
        <Route path="/module/english/quiz" element={<EnglishUnitListPage />} />
        <Route path="/module/english/quiz/:unitId" element={<EnglishUnitQuizPage />} />
        <Route path="/module/english/exercises" element={<EnglishExercisesPage />} />
        <Route path="english/exercises/audio" element={<AudioExercisePage />} />
        <Route path="/english/exercises/word-match" element={<WordMatchExercisePage />} />
        <Route path="/english/exercises/word-sorting" element={<WordSortingPage />} />
        <Route path="/module/math/exercises" element={<MathExercisesPage />} />
        <Route path="/math/exercises/dice" element={<MathDiceGamePage />} />
        <Route path="/math/exercises/bar-graph" element={<BarGraphExercisePage />} />
        <Route path="/math/exercises/even-or-odd" element={<EvenOrOddPage />} />
        <Route path="/module/science/exercises" element={<ScienceExercisesPage />} />
        <Route path="/science/exercises/weather-challenge" element={<ScienceWeatherChallengePage />} />
        <Route path="/science/exercises/float-sink" element={<ScienceFloatSinkGamePage />} />
        <Route path="/science/exercises/magnetic-or-not" element={<ScienceMagnetGamePage />} />
        <Route path="/draw" element={<DrawPage />} />
        <Route path="/paint" element={<PaintGalleryPage />} />
        <Route path="/paint/:id" element={<PaintEditorPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/pop" element={<BalloonGame />} />






      </Routes>
    </div>
  );
}

function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default RootApp;

