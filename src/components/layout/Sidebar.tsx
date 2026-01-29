'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Database,
    PieChart,
    Settings,
    Building2,
    Building,
    Users,
    UserCheck,
    Landmark,
    MessageSquare,
    BriefcaseBusiness,
    Wallet,
    Calendar,
    CreditCard,
    ChevronDown,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: '/dashboard',
    },
    {
        id: 'processos',
        label: 'Processos',
        icon: <FileText className="h-5 w-5" />,
        path: '/processos',
    },
    {
        id: 'documentos',
        label: 'Documentos',
        icon: <FileText className="h-5 w-5" />,
        path: '/documentos',
    },
    {
        id: 'cadastros',
        label: 'Cadastros',
        icon: <Database className="h-5 w-5" />,
        path: '/cadastros',
    },
    {
        id: 'chamados',
        label: 'Chamados',
        icon: <MessageSquare className="h-5 w-5" />,
        path: '/chamados',
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        icon: <PieChart className="h-5 w-5" />,
        path: '/relatorios',
    },
    {
        id: 'configuracoes',
        label: 'Configurações',
        icon: <Settings className="h-5 w-5" />,
        path: '/configuracoes',
    },
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    onLogout?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle, onLogout }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>(['cadastros']);

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
        return pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        if (onLogout) onLogout();
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.id);
        const itemIsActive = item.id === 'dashboard' ? isActive('/dashboard') : (item.path ? isActive(item.path) : false);

        if (hasChildren && !isCollapsed) {
            return (
                <Collapsible
                    key={item.id}
                    open={isOpen}
                    onOpenChange={() => toggleMenu(item.id)}
                >
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-3 text-left font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                level > 0 && 'pl-8',
                                isCollapsed && 'justify-center px-2'
                            )}
                        >
                            {item.icon}
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1">{item.label}</span>
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </>
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                        {item.children!.map((child) => renderMenuItem(child, level + 1))}
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        return (
            <Link key={item.id} href={item.path!}>
                <Button
                    variant={itemIsActive ? 'secondary' : 'ghost'}
                    className={cn(
                        'w-full justify-start gap-3 text-left text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                        level > 0 && 'pl-10 text-sm',
                        isCollapsed && 'justify-center px-0 h-10 w-10 mx-auto rounded-lg',
                        itemIsActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                        isCollapsed && itemIsActive && 'bg-sidebar-primary/20 text-sidebar-primary'
                    )}
                    title={isCollapsed ? item.label : undefined}
                >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                </Button>
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                'relative flex flex-col bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300 ease-in-out',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className={cn(
                    "absolute -right-4 top-6 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md border border-gray-200 text-gray-600 hover:text-primary transition-all duration-300",
                    isCollapsed && "rotate-180"
                )}
            >
                <ChevronRight className="h-4 w-4" />
            </button>

            {/* Logo */}
            <div className={cn(
                "flex items-center gap-3 p-4 border-b border-sidebar-border transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-4"
            )}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-lg shadow-sidebar-primary/20">
                    SG
                </div>
                {!isCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <h1 className="font-bold text-lg text-sidebar-foreground leading-none">SIAGOV</h1>
                        <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70 mt-1">
                            Sistema de Gestão
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-6">
                <nav className={cn("space-y-2 flex flex-col", isCollapsed && "items-center")}>
                    {menuItems.map((item) => renderMenuItem(item))}
                </nav>
            </ScrollArea>

            {/* User Section */}
            <div className={cn(
                "border-t border-sidebar-border p-4 transition-all duration-300",
                isCollapsed && "px-2 flex flex-col items-center"
            )}>
                {user && !isCollapsed && (
                    <div className="mb-3 px-2 animate-in fade-in duration-500">
                        <p className="font-medium text-sm truncate text-sidebar-foreground">{user.nome}</p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">
                            {user.email}
                        </p>
                    </div>
                )}
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(
                        'w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200',
                        isCollapsed && 'justify-center h-10 w-10 rounded-lg px-0'
                    )}
                    title={isCollapsed ? "Sair" : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Sair</span>}
                </Button>
            </div>
        </aside>
    );
}

export default Sidebar;
