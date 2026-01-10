import { Menu } from 'lucide-react';
import { cn } from '../../ui';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    items: SidebarItem[];
    activeId: string;
    onSelect: (id: string) => void;
    className?: string;
}

export function Sidebar({ items, activeId, onSelect, className }: SidebarProps) {
    return (
        <aside
            className={cn(
                "bg-surface border-r border-border flex flex-col h-full shadow-sm w-72",
                className
            )}
        >
            {/* Header */}
            <div className="h-20 flex items-center px-8 border-b border-border bg-surface-1">
                <div className="flex flex-col">
                    <span className="text-xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">FIRQA</span>
                    <span className="text-[10px] text-text-muted uppercase tracking-[0.25em] font-bold">Espace Passager</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-5 mb-4 text-text-muted">
                    <button className="w-10 h-10 flex items-center justify-center bg-surface-2 rounded-xl border border-border/50 text-text-muted hover:text-primary hover:border-primary transition-all duration-300">
                        <Menu size={20} />
                    </button>
                </div>
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={cn(
                                "group w-full flex items-center px-5 py-4 gap-4 rounded-2xl transition-all duration-200 outline-none font-bold tracking-tight",
                                isActive
                                    ? "bg-primary text-white shadow-xl shadow-primary/25"
                                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                            )}
                        >
                            <span className={cn(
                                "transition-transform duration-300",
                                isActive ? "scale-110" : "text-text-muted group-hover:text-primary group-hover:scale-110"
                            )}>
                                {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
