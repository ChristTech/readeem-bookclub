import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export const MainLayout: React.FC = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C41230]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
            <Navbar isAdmin={isAdmin} isRegistered={!!user} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
