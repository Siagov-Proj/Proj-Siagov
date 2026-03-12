'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { CadastroDialogProvider } from '@/components/cadastros/cadastro-dialog-provider';
import { useAuthStore } from '@/hooks/useAuth';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <ThemeProvider>
            <CadastroDialogProvider>
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
            </CadastroDialogProvider>
        </ThemeProvider>
    );
}
