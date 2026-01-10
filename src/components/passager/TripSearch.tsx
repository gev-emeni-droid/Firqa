import { useState, useEffect } from 'react';
import { Search, MapPin, Users, ArrowRight, CheckCircle, Navigation, X, CreditCard, AlertCircle } from 'lucide-react';
import { Card, CardContent, Button, Badge, CardHeader, CardTitle } from '../../ui';
import { getActiveTrips } from '../../services/trip';
import { createBooking } from '../../services/booking';
import { useAuth } from '../../context/AuthContext';
import { Trip } from '../../types';

export function TripSearch() {
    const { session, getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const [searchTerm, setSearchTerm] = useState({ origin: '', destination: '' });
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
    const [selectedTripForPayment, setSelectedTripForPayment] = useState<Trip | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'apple_pay' | 'google_pay'>('card');
    const [numSeats, setNumSeats] = useState(1);
    const [luggage, setLuggage] = useState({ bags: 0, suitcases: 0 });

    const BAG_FEE = 0.500;
    const SUITCASE_FEE = 2.000;
    const SERVICE_RATE_COLLECTIVE = 0.09;
    const SERVICE_RATE_PRIVATE = 0.15;
    const VAT_RATE = 0.19;

    const calculatePriceDetails = () => {
        if (!selectedTripForPayment) {
            return {
                base: 0,
                luggageTotal: 0,
                serviceFee: 0,
                total: 0
            };
        }

        const base = selectedTripForPayment.pricePerSeat * numSeats;
        const luggageTotal = (luggage.bags * BAG_FEE) + (luggage.suitcases * SUITCASE_FEE);
        const serviceRate = selectedTripForPayment.isPrivate ? SERVICE_RATE_PRIVATE : SERVICE_RATE_COLLECTIVE;
        const serviceFeeBase = base * serviceRate;
        const serviceFeeVat = serviceFeeBase * VAT_RATE;
        const serviceFeeTotal = serviceFeeBase + serviceFeeVat;
        const total = base + luggageTotal + serviceFeeTotal;

        return { base, luggageTotal, serviceFee: serviceFeeTotal, total };
    };

    const calculateTotal = () => {
        return calculatePriceDetails().total;
    };

    useEffect(() => {
        const activeTrips = getActiveTrips();
        setTrips(activeTrips);
        setFilteredTrips(activeTrips);
    }, []);

    const handleSearch = () => {
        const filtered = trips.filter(trip =>
            trip.origin.toLowerCase().includes(searchTerm.origin.toLowerCase()) &&
            trip.destination.toLowerCase().includes(searchTerm.destination.toLowerCase())
        );
        setFilteredTrips(filtered);
    };

    const handleBook = (trip: Trip) => {
        if (!session?.userId) {
            alert("Veuillez vous connecter pour réserver.");
            return;
        }

        if (trip.availableSeats <= 0) {
            alert("Plus de places disponibles.");
            return;
        }

        setSelectedTripForPayment(trip);
    };

    const confirmBooking = () => {
        if (!selectedTripForPayment || !session?.userId) return;

        if (paymentMethod === 'card') {
            alert("Redirection vers la plateforme de paiement sécurisée...");
        } else {
            alert("Réservation confirmée. Rappel : Le paiement en espèces doit être effectué auprès du chauffeur AVANT de monter dans le véhicule.");
        }

        createBooking({
            tripId: selectedTripForPayment.id,
            passengerId: session.userId,
            passengerName: `${user?.nom}`,
            passengerPhone: user?.telephone || '',
            seatsRequested: numSeats,
            totalPrice: calculateTotal(),
            isPrivate: false,
        });

        setBookingSuccess(selectedTripForPayment.id);
        setSelectedTripForPayment(null);
        setNumSeats(1);
        setLuggage({ bags: 0, suitcases: 0 });

        // Refresh trips
        const updatedTrips = getActiveTrips();
        setTrips(updatedTrips);
        setFilteredTrips(updatedTrips.filter(t =>
            t.origin.toLowerCase().includes(searchTerm.origin.toLowerCase()) &&
            t.destination.toLowerCase().includes(searchTerm.destination.toLowerCase())
        ));

        setTimeout(() => setBookingSuccess(null), 3000);
    };

    const priceDetails = calculatePriceDetails();

    return (
        <div className="space-y-10">
            <div className="bg-text text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black mb-6 tracking-tight">Où voulez-vous <span className="text-accent text-5xl">aller ?</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                            <input
                                type="text"
                                placeholder="Départ"
                                className="w-full bg-white/10 border border-white/20 p-4 pl-12 rounded-2xl outline-none focus:border-accent text-white placeholder:text-white/40 font-bold"
                                value={searchTerm.origin}
                                onChange={e => setSearchTerm({ ...searchTerm, origin: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                            <input
                                type="text"
                                placeholder="Destination"
                                className="w-full bg-white/10 border border-white/20 p-4 pl-12 rounded-2xl outline-none focus:border-accent text-white placeholder:text-white/40 font-bold"
                                value={searchTerm.destination}
                                onChange={e => setSearchTerm({ ...searchTerm, destination: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSearch} className="bg-white text-black hover:bg-accent hover:text-white px-10 py-6 text-lg font-black rounded-2xl">
                        Rechercher <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>
                <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Search size={20} className="text-accent" /> {filteredTrips.length} trajets disponibles
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTrips.map(trip => (
                        <Card key={trip.id} className="group hover:border-accent hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-2">
                                        <Badge tone="success">✓ {trip.status === 'active' ? 'En route' : 'Planifié'}</Badge>
                                        <div className="text-sm text-secondary font-bold">Par {trip.driverName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-primary">{trip.pricePerSeat} TND</div>
                                        <div className="text-[10px] text-secondary font-bold uppercase tracking-widest">Par personne</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-4 h-4 rounded-full border-4 border-accent bg-bg" />
                                        <div className="w-0.5 h-8 bg-dashed border-l border-border" />
                                        <MapPin size={24} className="text-primary" />
                                    </div>
                                    <div className="flex-1 font-black text-xl space-y-4">
                                        <div>{trip.origin}</div>
                                        <div>{trip.destination}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <div className="flex items-center gap-2 text-secondary font-bold">
                                        <Users size={18} />
                                        <span>{trip.availableSeats} places libres</span>
                                    </div>

                                    {bookingSuccess === trip.id ? (
                                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl pointer-events-none">
                                            <CheckCircle size={18} className="mr-2" /> Réservé !
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleBook(trip)}
                                            className="px-6 py-3 rounded-xl font-black shadow-lg shadow-primary/20"
                                            disabled={trip.availableSeats <= 0}
                                        >
                                            {trip.availableSeats <= 0 ? 'Complet' : 'Réserver'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredTrips.length === 0 && (
                        <div className="lg:col-span-2 text-center py-20 bg-surface rounded-[3rem] border border-dashed border-border">
                            <p className="text-secondary text-lg italic">Aucun trajet ne correspond à votre recherche.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de paiement */}
            {selectedTripForPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-primary text-white p-8 flex-shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <CardTitle className="text-2xl font-black">Confirmation & Paiement</CardTitle>
                                <button onClick={() => setSelectedTripForPayment(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl">
                                <div className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">Trajet</div>
                                <div className="text-lg font-black">{selectedTripForPayment.origin} → {selectedTripForPayment.destination}</div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                            {/* Sélection Nombre de places */}
                            <div className="space-y-4 pt-4">
                                <h4 className="font-black text-lg text-gray-900 border-b pb-2">Passagers & Bagages</h4>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="font-bold">Nombre de places</div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-black hover:bg-accent hover:text-white transition-all shadow-sm"
                                        >-</button>
                                        <span className="text-xl font-black w-8 text-center">{numSeats}</span>
                                        <button
                                            onClick={() => setNumSeats(Math.min(selectedTripForPayment.availableSeats, numSeats + 1))}
                                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-black hover:bg-accent hover:text-white transition-all shadow-sm"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                            <div className="font-bold">Sacs</div>
                                            <div className="text-[10px] text-secondary">0.500 TND / unité</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setLuggage(l => ({ ...l, bags: Math.max(0, l.bags - 1) }))} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">-</button>
                                            <span className="font-black">{luggage.bags}</span>
                                            <button onClick={() => setLuggage(l => ({ ...l, bags: l.bags + 1 }))} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                            <div className="font-bold">Valises</div>
                                            <div className="text-[10px] text-secondary">2.000 TND / unité</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setLuggage(l => ({ ...l, suitcases: Math.max(0, l.suitcases - 1) }))} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">-</button>
                                            <span className="font-black">{luggage.suitcases}</span>
                                            <button onClick={() => setLuggage(l => ({ ...l, suitcases: l.suitcases + 1 }))} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Détail du prix */}
                            <div className="bg-[#2F2E2E] text-white p-6 rounded-[2rem] space-y-3">
                                <div className="flex justify-between items-center text-sm opacity-80">
                                    <span>Prix du trajet ({numSeats} pl.)</span>
                                    <span>{priceDetails.base.toFixed(3)} TND</span>
                                </div>
                                <div className="flex justify-between items-center text-sm opacity-80">
                                    <span>Frais de bagages</span>
                                    <span>{priceDetails.luggageTotal.toFixed(3)} TND</span>
                                </div>
                                <div className="flex justify-between items-center text-sm opacity-80">
                                    <span>Frais de service {selectedTripForPayment?.isPrivate ? '(15% + TVA)' : '(9% + TVA)'}</span>
                                    <span>{priceDetails.serviceFee.toFixed(3)} TND</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                        <span className="font-black text-lg block">Total TTC</span>
                                        <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">TVA incluse</span>
                                    </div>
                                    <span className="text-2xl font-black text-accent">{priceDetails.total.toFixed(3)} TND</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black text-lg mb-4">Choisissez votre mode de règlement</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        {
                                            id: 'card',
                                            label: 'Carte Bancaire',
                                            description: 'Visa, Mastercard, AmEx',
                                            icon: <CreditCard className={paymentMethod === 'card' ? 'text-accent' : 'text-secondary'} />
                                        },
                                        {
                                            id: 'apple_pay',
                                            label: 'Apple Pay',
                                            description: 'Paiement via Wallet',
                                            icon: <div className={`px-3 py-1 rounded-lg text-xs font-black ${paymentMethod === 'apple_pay' ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700'}`}> Pay</div>
                                        },
                                        {
                                            id: 'google_pay',
                                            label: 'Google Pay',
                                            description: 'Paiement via GPay',
                                            icon: <div className={`px-3 py-1 rounded-lg text-xs font-black ${paymentMethod === 'google_pay' ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700'}`}>G Pay</div>
                                        },
                                        {
                                            id: 'cash',
                                            label: 'Espèces',
                                            description: 'À remettre au chauffeur',
                                            icon: <Users className={paymentMethod === 'cash' ? 'text-accent' : 'text-secondary'} />
                                        }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setPaymentMethod(option.id as typeof paymentMethod)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${paymentMethod === option.id
                                                ? 'border-accent bg-accent/5 text-primary'
                                                : 'border-border hover:border-accent/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {option.icon}
                                                <div className="text-left">
                                                    <div className="font-black">{option.label}</div>
                                                    <div className="text-xs text-secondary font-bold">{option.description}</div>
                                                </div>
                                            </div>
                                            {paymentMethod === option.id && <CheckCircle className="text-accent" size={20} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {paymentMethod === 'cash' && (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="text-orange-600 mt-1 flex-shrink-0" size={18} />
                                    <p className="text-sm text-orange-900 font-medium">
                                        <span className="font-black">Important :</span> Pour valider votre réservation en espèces, vous devez impérativement remettre le montant au chauffeur dès son arrivée, avant l'installation de vos bagages.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <div className="p-8 border-t border-border bg-surface-2 flex-shrink-0">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm font-black text-secondary">
                                    <span>Total TTC (TVA incluse)</span>
                                    <span className="text-xl text-primary">{priceDetails.total.toFixed(3)} TND</span>
                                </div>
                                <Button onClick={confirmBooking} className="w-full py-6 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">
                                    {paymentMethod === 'cash' ? 'Confirmer la réservation' : 'Procéder au paiement'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
