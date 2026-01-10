import { useState, useEffect } from 'react';
import { MapPin, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, Badge } from '../../ui';
import { getBookingsByPassenger } from '../../services/booking';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';

export function Historique() {
    const { session } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (session?.userId) {
            setBookings(getBookingsByPassenger(session.userId));
        }
    }, [session]);

    if (bookings.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-surface-2 rounded-[3rem] border border-dashed border-border">
                <Clock className="w-16 h-16 text-secondary mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-black mb-2">Aucun trajet trouvé</h2>
                <p className="text-secondary">Vos futurs voyages s'afficheront ici.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">Historique des trajets</h1>
                <p className="text-secondary text-lg">Retrouvez tous vos déplacements passés avec Firqa.</p>
            </div>

            <div className="grid gap-6">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="group hover:border-accent/40 hover:shadow-xl transition-all duration-300 rounded-[2rem]">
                        <CardContent className="p-8 flex flex-col sm:flex-row justify-between items-center gap-8">
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center gap-2 text-text-muted text-sm font-bold uppercase tracking-widest">
                                    <Calendar size={14} className="text-accent" />
                                    {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-3 h-3 rounded-full border-2 border-primary" />
                                        <div className="w-0.5 h-6 bg-border" />
                                        <MapPin size={16} className="text-accent" />
                                    </div>
                                    <div className="font-black text-xl flex flex-col gap-1">
                                        <span className="text-text-muted text-xs font-bold uppercase tracking-tighter">Réservation</span>
                                        {booking.seatsRequested} place(s) - {booking.isPrivate ? 'Privé' : 'Collectif'}
                                        <div className="text-sm font-medium text-secondary mt-1">
                                            ID Trajet: {booking.tripId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                                <div className="text-3xl font-black text-primary">{booking.totalPrice} TND</div>
                                <Badge tone={booking.status === 'confirmed' ? 'success' : 'error'} className="px-4 py-1.5 rounded-full font-bold">
                                    <div className="flex items-center gap-2">
                                        {booking.status === 'confirmed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {booking.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                                    </div>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
