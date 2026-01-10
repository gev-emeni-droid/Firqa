import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, Clock, Calendar, Star, CheckCircle, AlertCircle, TrendingUp, Filter, Search, XCircle } from 'lucide-react';
import { Trip, BookingRequest } from '../types';
import { notificationService } from '../services/notificationService';
import BookingCancellation from './BookingCancellation';

interface TripManagementProps {
  trip: Trip;
  bookings: BookingRequest[];
  onUpdateTrip: (updatedTrip: Trip) => void;
  onClose: () => void;
}

const TripManagement: React.FC<TripManagementProps> = ({ trip, bookings, onUpdateTrip, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'passengers' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted'>('all');
  const [showCancellation, setShowCancellation] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<BookingRequest | null>(null);

  // Calculer les places restantes en temps réel
  const acceptedBookings = bookings.filter(b => b.tripId === trip.id && b.status === 'accepted');
  const pendingBookings = bookings.filter(b => b.tripId === trip.id && b.status === 'pending');
  const totalPassengers = acceptedBookings.reduce((sum, b) => sum + b.passengerCount, 0);
  const remainingSeats = trip.availableSeats - totalPassengers;
  const occupancyRate = (totalPassengers / trip.totalSeats) * 100;

  // Filtrer les réservations
  const filteredBookings = bookings
    .filter(b => b.tripId === trip.id)
    .filter(b => {
      if (filterStatus === 'all') return true;
      return b.status === filterStatus;
    })
    .filter(b => 
      b.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.route.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAcceptBooking = (bookingId: string) => {
    // Mettre à jour le statut de la réservation
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'accepted' as const } : b
    );
    
    // Recalculer les places disponibles
    const newTotalPassengers = updatedBookings
      .filter(b => b.tripId === trip.id && b.status === 'accepted')
      .reduce((sum, b) => sum + b.passengerCount, 0);
    
    const updatedTrip = {
      ...trip,
      availableSeats: trip.totalSeats - newTotalPassengers
    };
    
    onUpdateTrip(updatedTrip);
    
    // Notifier le passager
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      notificationService.notifyBookingAccepted(
        booking.passengerName,
        'Chauffeur Firqa',
        booking.route
      );
    }
  };

  const handleDeclineBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'declined' as const } : b
    );
    
    // Notifier le passager
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      notificationService.notifyBookingDeclined(
        booking.passengerName,
        'Chauffeur Firqa',
        booking.route
      );
    }
  };

  const handleCancelBooking = (booking: BookingRequest) => {
    setSelectedBookingForCancellation(booking);
    setShowCancellation(true);
  };

  const handleConfirmBookingCancellation = (bookingId: string, reason: string) => {
    // Mettre à jour le statut de la réservation
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'declined' as const } : b
    );
    
    // Recalculer les places disponibles
    const newTotalPassengers = updatedBookings
      .filter(b => b.tripId === trip.id && b.status === 'accepted')
      .reduce((sum, b) => sum + b.passengerCount, 0);
    
    const updatedTrip = {
      ...trip,
      availableSeats: trip.totalSeats - newTotalPassengers
    };
    
    onUpdateTrip(updatedTrip);
    setShowCancellation(false);
    setSelectedBookingForCancellation(null);
  };

  const formatLuggageDetails = (luggageDetails?: any) => {
    if (!luggageDetails) return '0 bagage';
    
    const sac = typeof luggageDetails.sac === 'number' ? luggageDetails.sac : 0;
    const petiteValise = typeof luggageDetails.petiteValise === 'number' ? luggageDetails.petiteValise : 0;
    const moyenneValise = typeof luggageDetails.moyenneValise === 'number' ? luggageDetails.moyenneValise : 0;
    const grandeValise = typeof luggageDetails.grandeValise === 'number' ? luggageDetails.grandeValise : 0;
    
    const total = sac + petiteValise + moyenneValise + grandeValise;
    if (total === 0) return '0 bagage';
    
    const details = [];
    if (sac > 0) details.push(`${sac} sac`);
    if (petiteValise > 0) details.push(`${petiteValise} petite valise`);
    if (moyenneValise > 0) details.push(`${moyenneValise} moyenne valise`);
    if (grandeValise > 0) details.push(`${grandeValise} grande valise`);
    
    return `${total} article${total > 1 ? 's' : ''} (${details.join(', ')})`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black mb-2">Gestion du trajet</h2>
              <div className="text-lg opacity-90">{trip.origin} → {trip.destination}</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Stats principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{remainingSeats}/{trip.totalSeats}</div>
              <div className="text-xs">Places restantes</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{totalPassengers}</div>
              <div className="text-xs">Passagers confirmés</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{pendingBookings.length}</div>
              <div className="text-xs">En attente</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{occupancyRate.toFixed(0)}%</div>
              <div className="text-xs">Taux de remplissage</div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Aperçu', icon: TrendingUp },
            { id: 'passengers', label: 'Passagers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#D5BDAF] border-b-2 border-[#D5BDAF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Informations du trajet */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Informations du trajet</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-green-600" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Départ</div>
                      <div className="font-bold">{trip.origin}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-red-600" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Arrivée</div>
                      <div className="font-bold">{trip.destination}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-600" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Heure</div>
                      <div className="font-bold">{trip.departureTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-600" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-bold">Aujourd'hui</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taux de remplissage visuel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Taux de remplissage</h3>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div 
                      className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    >
                      {occupancyRate.toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>0 passagers</span>
                    <span>{trip.totalSeats} passagers</span>
                  </div>
                </div>
              </div>

              {/* Réservations récentes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Réservations récentes</h3>
                <div className="space-y-3">
                  {filteredBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {booking.passengerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{booking.passengerName}</div>
                          <div className="text-sm text-gray-500">
                            {booking.passengerCount} passager(s) • {formatLuggageDetails(booking.luggageDetails)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status === 'accepted' ? 'Confirmé' :
                         booking.status === 'pending' ? 'En attente' : 'Refusé'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passengers' && (
            <div className="space-y-6">
              {/* Filtres */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un passager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'Tous' },
                    { value: 'pending', label: 'En attente' },
                    { value: 'accepted', label: 'Confirmés' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setFilterStatus(status.value as any)}
                      className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                        filterStatus === status.value
                          ? 'bg-[#D5BDAF] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des passagers */}
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Aucune réservation trouvée</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                            {booking.passengerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{booking.passengerName}</div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div>👥 {booking.passengerCount} passager(s)</div>
                              <div>🧳 {formatLuggageDetails(booking.luggageDetails)}</div>
                              <div>🕐 Réservé à {booking.timestamp}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status === 'accepted' ? 'Confirmé' :
                             booking.status === 'pending' ? 'En attente' : 'Refusé'}
                          </span>
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptBooking(booking.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle size={16} className="inline mr-1" />
                                Accepter
                              </button>
                              <button
                                onClick={() => handleDeclineBooking(booking.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                              >
                                <X size={16} className="inline mr-1" />
                                Refuser
                              </button>
                            </div>
                          )}
                          {booking.status === 'accepted' && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors"
                              title="Annuler la réservation"
                            >
                              <XCircle size={16} className="inline mr-1" />
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Statistiques des réservations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total des réservations:</span>
                      <span className="font-bold">{filteredBookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux d'acceptation:</span>
                      <span className="font-bold">
                        {filteredBookings.length > 0 
                          ? ((acceptedBookings.length / filteredBookings.length) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenu potentiel:</span>
                      <span className="font-bold">{totalPassengers * trip.priceCollective} TND</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Répartition des bagages</h3>
                  <div className="space-y-2">
                    {acceptedBookings.map((booking) => {
                      if (!booking.luggageDetails) return null;
                      return (
                        <div key={booking.id} className="text-sm">
                          <div className="font-medium">{booking.passengerName}:</div>
                          <div className="text-gray-600 ml-2">{formatLuggageDetails(booking.luggageDetails)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'annulation de réservation */}
      {showCancellation && selectedBookingForCancellation && (
        <BookingCancellation
          booking={selectedBookingForCancellation}
          tripOrigin={trip.origin}
          tripDestination={trip.destination}
          onCancel={handleConfirmBookingCancellation}
          onClose={() => {
            setShowCancellation(false);
            setSelectedBookingForCancellation(null);
          }}
        />
      )}
    </div>
  );
};

export default TripManagement;
