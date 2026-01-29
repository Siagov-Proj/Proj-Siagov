'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/hooks/useTheme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const isDark = useThemeStore((state) => state.isDark);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return <>{children}</>;
}

export default ThemeProvider;
