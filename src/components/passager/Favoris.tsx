import { Star, MapPin, ChevronRight, User } from 'lucide-react';
import { Card, CardContent } from '../../ui';

export function Favoris() {
    const favorites = [
        { id: 1, name: 'Sami B.', route: 'Tunis → Sousse', rating: 4.8, trips: 156 },
        { id: 2, name: 'Ahmed M.', route: 'Sfax → Tunis', rating: 4.9, trips: 89 },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-3 tracking-tight">Mes Favoris</h1>
                    <p className="text-secondary text-lg">Retrouvez les chauffeurs et trajets que vous préférez.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((fav) => (
                    <Card key={fav.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                                    <User size={32} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-xl font-black">{fav.name}</h3>
                                        <div className="flex items-center gap-1 text-accent font-black">
                                            <Star size={16} fill="currentColor" /> {fav.rating}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-secondary font-bold text-sm">
                                        <MapPin size={14} /> {fav.route}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                                <div className="text-xs font-bold text-secondary uppercase tracking-widest">{fav.trips} trajets effectués</div>
                                <button
                                    onClick={() => window.open(`/driver-profile/${fav.id}`, '_blank')}
                                    className="p-3 bg-surface-2 rounded-xl text-primary hover:bg-black hover:text-white transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <button className="rounded-[2.5rem] border-4 border-dashed border-border p-10 flex flex-col items-center justify-center gap-4 text-secondary hover:text-accent hover:border-accent transition-all group">
                    <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-accent/10">
                        <Plus size={32} />
                    </div>
                    <span className="font-black text-lg">Ajouter un favori</span>
                </button>
            </div>
        </div>
    );
}

function Plus({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
