import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReadingPlan } from './types';
import { INITIAL_PLANS, MOCK_USER } from './constants';
import { MainLayout } from './layouts/MainLayout';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { ReadingPlanPage } from './pages/ReadingPlanPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { JournalPage } from './pages/JournalPage';
import { AdminPage } from './pages/AdminPage';

const App: React.FC = () => {
    const [plans, setPlans] = useState<ReadingPlan[]>(INITIAL_PLANS);

    const handleUpdateProgress = (id: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id === id) {
                if (p.totalPages && p.totalPages > 0) {
                    const goal = p.dailyPageGoal || 10;
                    const current = p.currentPage || 0;
                    return { ...p, currentPage: Math.min(p.totalPages, current + goal) };
                }
                return { ...p, currentChapter: Math.min(p.totalChapters || 0, p.currentChapter + 1) };
            }
            return p;
        }));
    };

    return (
        <ToastProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/join" element={<JoinPage setIsRegistered={() => { }} />} /> {/* setIsRegistered prop is now no-op, will refactor JoinPage later to remove prop */}
                    <Route path="/readings" element={<ReadingPlanPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
};

export default App;
