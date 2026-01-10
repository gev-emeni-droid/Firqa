import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Clock,
  Users,
  Check,
  Lock,
  Navigation,
  Zap,
  QrCode,
  Car,
  TrendingUp,
  Bell,
  Calendar
} from 'lucide-react';
import { Trip, BookingRequest, Transaction } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { ROUTES } from '../constants';
import TripCancellation from './TripCancellation';
import TripManagement from './TripManagement';
import DriverOnDemand from './DriverOnDemand';

type PrivatizationStatus = 'pending' | 'confirmed';

interface DriverPrivatization {
  id: string;
  clientName: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: PrivatizationStatus;
  notes?: string;
}

interface DriverCockpitProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  requests: BookingRequest[];
  onHandleRequest: (id: string, status: 'accepted' | 'declined') => void;
}

const DriverCockpit: React.FC<DriverCockpitProps> = ({ trips, setTrips, requests }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'income', amount: 45, category: 'Course Tunis-Sousse', date: '2023-10-25', description: '3 places' },
    { id: '2', type: 'expense', amount: 15, category: 'Carburant', date: '2023-10-25', description: 'Station Agil' },
    { id: '3', type: 'income', amount: 120, category: 'Privatisation', date: '2023-10-24', description: 'Famille touriste' }
  ]);
  const [aiInsights, setAiInsights] = useState<{ predictedProfit: number; insights: string[] } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [tripForm, setTripForm] = useState<Partial<Trip>>({
    origin: ROUTES[0],
    destination: ROUTES[1],
    departureTime: '08:00',
    priceCollective: 8,
    pricePrivate: 60,
    totalSeats: 8
  });
  const [showTripManagement, setShowTripManagement] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showDriverOnDemand, setShowDriverOnDemand] = useState(false);
  const [selectedTripForManagement, setSelectedTripForManagement] = useState<Trip | null>(null);
  const [selectedTripForCancellation, setSelectedTripForCancellation] = useState<Trip | null>(null);
  const [privateTrips] = useState<DriverPrivatization[]>([
    {
      id: 'priv1',
      clientName: 'Famille Ben Salem',
      origin: 'Tunis',
      destination: 'Djerba',
      departureDate: '2026-01-18',
      departureTime: '08:00',
      price: 450,
      status: 'confirmed'
    },
    {
      id: 'priv2',
      clientName: 'Société Novatech',
      origin: 'Sfax',
      destination: 'Tunis',
      departureDate: '2026-01-21',
      departureTime: '06:30',
      price: 520,
      status: 'pending',
      notes: 'Transport équipe + matériel'
    }
  ]);

  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  const activePrivateTrips = useMemo(
    () => privateTrips.filter(trip => trip.status === 'pending' || trip.status === 'confirmed'),
    [privateTrips]
  );

  const confirmedPrivatizations = activePrivateTrips.filter(t => t.status === 'confirmed').length;
  const pendingPrivatizations = activePrivateTrips.filter(t => t.status === 'pending').length;

  const fetchInsights = async () => {
    try {
      setLoadingAI(true);
      const result = await getFinancialInsights(transactions);
      if (result) {
        setAiInsights({
          predictedProfit: result.predictedProfit ?? 0,
          insights: result.insights?.slice(0, 3) ?? ['Ajoutez des trajets pour voir des conseils personnalisés.']
        });
      } else {
        setAiInsights(null);
      }
    } catch (error) {
      console.error('Impossible de récupérer les insights IA', error);
      setAiInsights(null);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [transactions]);

  const handleCreateTrip = () => {
    if (!tripForm.origin || !tripForm.destination || !tripForm.departureTime) {
      alert('Complétez les informations du trajet.');
      return;
    }

    const newTrip: Trip = {
      id: `t${Date.now()}`,
      driverId: 'd1',
      origin: tripForm.origin,
      destination: tripForm.destination,
      departureTime: tripForm.departureTime,
      priceCollective: tripForm.priceCollective || 8,
      pricePrivate: tripForm.pricePrivate || 60,
      availableSeats: tripForm.totalSeats || 8,
      totalSeats: tripForm.totalSeats || 8,
      isPrivate: false,
      status: 'pending',
      recurrenceDays: selectedDays
    };

    setTrips(prev => [newTrip, ...prev]);
    setShowTripModal(false);
    setSelectedDays([]);
  };

  const handleInitiateTripManagement = (trip: Trip) => {
    setSelectedTripForManagement(trip);
    setShowTripManagement(true);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(trip => (trip.id === updatedTrip.id ? updatedTrip : trip)));
  };

  const handleInitiateCancellation = (trip: Trip) => {
    setSelectedTripForCancellation(trip);
    setShowCancellation(true);
  };

  const handleCancelTrip = (tripId: string, reason: string) => {
    console.info('Annulation du trajet', tripId, reason);
    setTrips(prev => prev.map(trip => (trip.id === tripId ? { ...trip, status: 'cancelled' } : trip)));
    setShowCancellation(false);
    setSelectedTripForCancellation(null);
  };

  const getPrivatizationStatusStyles = (status: PrivatizationStatus) => {
    if (status === 'confirmed') {
      return {
        borderColor: '#16a34a',
        badgeBg: 'bg-green-50',
        badgeText: 'text-green-700',
        badgeBorder: 'border-green-200',
        label: 'Confirmée'
      };
    }
    return {
      borderColor: '#facc15',
      badgeBg: 'bg-yellow-50',
      badgeText: 'text-yellow-700',
      badgeBorder: 'border-yellow-200',
      label: 'En attente'
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-[#2F2E2E]">Tableau de bord chauffeur</h2>
            <p className="text-sm text-[#7D4F50]">Vos trajets en cours et privatisations actives</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#7D4F50] bg-[#F5EBE0] px-3 py-1 rounded-full border border-[#D5BDAF]/40">
            <Bell size={14} /> {pendingRequests.length} demande(s) en attente
          </div>
        </div>

        {/* Trips section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#D5BDAF]/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-[#2F2E2E]">Trajets planifiés</h3>
            <button
              onClick={() => setShowTripModal(true)}
              className="bg-[#2F2E2E] text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-[#B08968] transition-all"
            >
              <Plus size={18} /> Nouveau trajet
            </button>
          </div>
          {trips.length === 0 ? (
            <div className="text-center py-12 text-[#7D4F50] text-sm">
              Aucun trajet publié. Cliquez sur “Nouveau trajet” pour démarrer votre journée.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 bg-[#FAF7F2] rounded-[1.75rem] border border-[#D5BDAF]/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-[#D5BDAF]/30 p-3 rounded-2xl text-[#B08968]">
                      <Car size={24} />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#2F2E2E]">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest">
                        <Clock size={12} /> {trip.departureTime || 'ASAP'}
                        <Calendar size={12} /> {trip.status === 'active' ? 'En cours' : 'Planifié'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <div className="text-center">
                      <div className="text-xl font-black text-[#2F2E2E]">
                        {trip.availableSeats}/{trip.totalSeats}
                      </div>
                      <div className="text-[10px] text-[#7D4F50] uppercase tracking-widest">Places</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 rounded-xl border border-[#D5BDAF]/40 text-[#7D4F50] hover:bg-white transition-colors"
                        onClick={() => handleInitiateTripManagement(trip)}
                      >
                        Gérer
                      </button>
                      <button
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-white transition-colors"
                        onClick={() => handleInitiateCancellation(trip)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes privatisations */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#D5BDAF]/10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-black text-[#2F2E2E]">Mes privatisations</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-black rounded-full bg-green-50 text-green-700 border border-green-200">
                Confirmées ({confirmedPrivatizations})
              </span>
              <span className="px-3 py-1 text-[10px] font-black rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                En attente ({pendingPrivatizations})
              </span>
            </div>
          </div>
          {activePrivateTrips.length === 0 ? (
            <div className="text-center py-10 text-[#7D4F50] text-sm">Aucune privatisation active.</div>
          ) : (
            <div className="space-y-3">
              {activePrivateTrips.map((trip) => {
                const styles = getPrivatizationStatusStyles(trip.status);
                return (
                  <div
                    key={trip.id}
                    className="p-4 bg-[#FAF7F2] rounded-[1.75rem] border flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    style={{ borderColor: styles.borderColor }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#2F2E2E] text-white p-3 rounded-2xl">
                        <Lock size={20} />
                      </div>
                      <div>
                        <div className="font-black text-lg text-[#2F2E2E]">{trip.clientName}</div>
                        <div className="text-xs text-[#7D4F50] uppercase tracking-widest font-bold flex items-center gap-2">
                          <Navigation size={12} /> {trip.origin} → {trip.destination}
                        </div>
                        <div className="text-xs text-[#7D4F50]/70 mt-1">
                          {trip.departureDate} • {trip.departureTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-black text-[#B08968]">{trip.price.toFixed(3)} TND</div>
                      <div className={`text-xs font-black px-3 py-1 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                        {styles.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-[#2F2E2E] text-[#D5BDAF] p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D5BDAF] rounded-full blur-[80px] opacity-20" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-white" />
              <h4 className="text-lg font-black text-white">Assistant Financier IA</h4>
            </div>
            {loadingAI ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-white/20 rounded-xl" />
                <div className="h-3 bg-white/10 rounded-xl w-3/4" />
              </div>
            ) : aiInsights ? (
              <div className="space-y-4 text-white">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#D5BDAF]/70 font-black">
                    Net Profit estimé
                  </div>
                  <div className="text-3xl font-black">
                    {aiInsights.predictedProfit?.toFixed(2) ?? '0.00'} <span className="text-lg">TND</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {aiInsights.insights.map((insight, index) => (
                    <li key={index} className="flex gap-2 opacity-80">
                      <span className="text-[#D5BDAF]">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-white/70">Ajoutez des courses pour bénéficier de recommandations personnalisées.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#D5BDAF]/20 text-center space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-2xl flex items-center justify-center mx-auto">
            <QrCode className="text-[#B08968]" size={28} />
          </div>
          <div>
            <h4 className="font-black text-base text-[#2F2E2E]">Recrutement client</h4>
            <p className="text-xs text-[#7D4F50] mt-1">
              Faites scanner votre QR code pour recevoir des réservations directes.
            </p>
          </div>
          <button className="w-full text-[#B08968] text-xs font-black border border-[#D5BDAF]/40 rounded-xl py-2.5 hover:bg-[#F5EBE0] transition-colors">
            Imprimer mon QR
          </button>
        </div>
      </div>

      {showTripModal && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-[3rem] w-full max-w-xl p-8 space-y-6 relative">
            <button
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#E3D5CA]/60 transition-colors"
              onClick={() => setShowTripModal(false)}
            >
              <X size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-black text-[#2F2E2E]">Planifier un trajet</h3>
              <p className="text-sm text-[#7D4F50]">Publiez rapidement une nouvelle rotation.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Départ</label>
                  <select
                    value={tripForm.origin}
                    onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  >
                    {ROUTES.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Destination</label>
                  <select
                    value={tripForm.destination}
                    onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  >
                    {ROUTES.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Heure</label>
                  <input
                    type="time"
                    value={tripForm.departureTime}
                    onChange={(e) => setTripForm({ ...tripForm, departureTime: e.target.value })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Places</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={tripForm.totalSeats}
                    onChange={(e) => setTripForm({ ...tripForm, totalSeats: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Tarif collectif</label>
                  <input
                    type="number"
                    value={tripForm.priceCollective}
                    onChange={(e) => setTripForm({ ...tripForm, priceCollective: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Tarif privatisation</label>
                  <input
                    type="number"
                    value={tripForm.pricePrivate}
                    onChange={(e) => setTripForm({ ...tripForm, pricePrivate: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-3 border border-[#D5BDAF]/40 rounded-xl bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#7D4F50]/70 uppercase">Jours de récurrence</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WEEK_DAYS.map((day) => {
                    const isActive = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDays((prev) =>
                            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-black border transition-colors ${
                          isActive
                            ? 'bg-[#2F2E2E] text-white border-[#2F2E2E]'
                            : 'bg-white text-[#2F2E2E] border-[#D5BDAF]/60 hover:border-[#B08968]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-[11px] text-[#7D4F50]/70 mt-1">
                    Sélectionnez les jours où ce trajet doit se publier automatiquement.
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateTrip}
                className="w-full bg-[#2F2E2E] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#B08968] transition-all"
              >
                Publier maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {showTripManagement && selectedTripForManagement && (
        <TripManagement
          trip={selectedTripForManagement}
          bookings={requests}
          onUpdateTrip={handleUpdateTrip}
          onClose={() => {
            setShowTripManagement(false);
            setSelectedTripForManagement(null);
          }}
        />
      )}

      {showCancellation && selectedTripForCancellation && (
        <TripCancellation
          trip={selectedTripForCancellation}
          bookings={requests}
          onCancel={handleCancelTrip}
          onClose={() => {
            setShowCancellation(false);
            setSelectedTripForCancellation(null);
          }}
        />
      )}

      {showDriverOnDemand && (
        <DriverOnDemand driverId="d1" onClose={() => setShowDriverOnDemand(false)} />
      )}
    </div>
  );
};

export default DriverCockpit;
