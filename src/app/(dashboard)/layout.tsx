'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isMounted, router]);

    // Don't render anything until mounted and authenticated
    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <ThemeProvider>
            <div className="flex h-screen bg-background overflow-hidden">
                {/* Sidebar */}
                <div className="hidden lg:block h-full transition-all duration-300 ease-in-out">
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                    <main className="flex-1 overflow-auto p-6 bg-muted/30">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
