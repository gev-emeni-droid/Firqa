import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import {
    Home,
    History,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, getCurrentUser } = useAuth();
    const user = getCurrentUser();

    const menuItems = [
        { id: 'home', label: 'Accueil', icon: <Home size={20} /> },
        { id: 'history', label: 'Historique', icon: <History size={20} /> },
        { id: 'payment', label: 'Moyens de paiement', icon: <CreditCard size={20} /> },
        { id: 'settings', label: 'Paramètres', icon: <Settings size={20} /> },
        { id: 'help', label: 'Centre d\'aide', icon: <HelpCircle size={20} /> },
    ];

    const handleLogout = () => {
        if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
            logout();
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col md:flex-row">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:block w-72 h-screen sticky top-0 overflow-hidden">
                <Sidebar
                    items={menuItems}
                    activeId={activeTab}
                    onSelect={onTabChange}
                    className="h-full"
                />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden bg-surface border-b border-border px-6 h-16 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl">
                <div className="text-xl font-black italic tracking-tighter text-primary">FIRQA</div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] flex md:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <Sidebar
                        items={menuItems}
                        activeId={activeTab}
                        onSelect={(id) => {
                            onTabChange(id);
                            setIsMobileMenuOpen(false);
                        }}
                        className="relative z-70 h-full shadow-2xl animate-in slide-in-from-left duration-500 w-72"
                    />
                </div>
            )}

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Top Header - ALWAYS ON TOP RIGHT */}
                <header className="h-20 border-b border-border bg-surface-1/50 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] hidden md:block">
                            Tableau de Bord
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-black text-text">{user?.nom || 'Passager'}</span>
                            <span className="text-[10px] text-accent font-bold uppercase tracking-widest leading-none mt-0.5">Vérifié</span>
                        </div>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-text-muted hover:text-danger hover:bg-danger/10 p-2.5 rounded-xl transition-all font-bold text-xs gap-2"
                        >
                            <span className="hidden sm:inline">Déconnexion</span>
                            <LogOut size={18} />
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 md:p-12">
                    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
