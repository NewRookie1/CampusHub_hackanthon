import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CursorGlow from './components/CursorGlow';
import AmbientBackground from './components/AmbientBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Roadmaps from './pages/Roadmaps';
import RoadmapDetail from './pages/RoadmapDetail';
import SkillGraph from './pages/SkillGraph';
import Competitions from './pages/Competitions';
import CompetitionDetail from './pages/CompetitionDetail';
import MockTest from './pages/MockTest';
import SkillGap from './pages/SkillGap';
import Interview from './pages/Interview';
import AIHR from './pages/AIHR';
import Company from './pages/Company';
import JobPostings from './pages/JobPostings';
import TalentPool from './pages/TalentPool';
import HRAnalytics from './pages/HRAnalytics';
const Globe = lazy(() => import('./pages/Globe'));
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><Dashboard /></ProtectedRoute>} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
            <Route path="/skill-graph" element={<SkillGraph />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/competitions/:id" element={<CompetitionDetail />} />
            <Route path="/mock-test" element={<ProtectedRoute requiredRole="student"><MockTest /></ProtectedRoute>} />
            <Route path="/skill-gap" element={<ProtectedRoute requiredRole="student"><SkillGap /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute requiredRole="student"><Interview /></ProtectedRoute>} />
            <Route path="/ai-hr" element={<ProtectedRoute requiredRole="hr/company"><AIHR /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute requiredRole="hr/company"><Company /></ProtectedRoute>} />
            <Route path="/job-postings" element={<ProtectedRoute requiredRole="hr/company"><JobPostings /></ProtectedRoute>} />
            <Route path="/talent-pool" element={<ProtectedRoute requiredRole="hr/company"><TalentPool /></ProtectedRoute>} />
            <Route path="/hr-analytics" element={<ProtectedRoute requiredRole="hr/company"><HRAnalytics /></ProtectedRoute>} />
            <Route path="/globe" element={<Suspense fallback={<div className="flex items-center justify-center h-96 text-white/40">Loading globe...</div>}><Globe /></Suspense>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
