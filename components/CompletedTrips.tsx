import React, { useState } from 'react';
import { X, Clock, MapPin, Users, Star, Calendar, TrendingUp, DollarSign, Filter, Search } from 'lucide-react';
import { historyService } from '../services/historyService';
import { ratingService } from '../services/ratingService';

interface CompletedTripsProps {
  driverId: string;
  onClose: () => void;
}

const CompletedTrips: React.FC<CompletedTripsProps> = ({ driverId, onClose }) => {
  const [trips, setTrips] = useState(historyService.getUserTripHistory(driverId, 'driver'));
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchTerm === '' || 
      trip.trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    
    const tripDate = new Date(trip.trip.id); // Simplifié
    const now = new Date();
    const daysDiff = (now.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (filter === 'week') return matchesSearch && daysDiff <= 7;
    if (filter === 'month') return matchesSearch && daysDiff <= 30;
    
    return matchesSearch;
  });

  const analytics = historyService.getTripAnalytics(driverId, 'driver', 'month');
  const performance = historyService.getPerformanceMetrics(driverId, 'driver');

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (tripId: string) => {
    // Simplification - utiliser l'ID comme date pour la démo
    const date = new Date();
    return date.toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Mes trajets effectués</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{analytics.totalTrips}</div>
              <div className="text-xs">Trajets ce mois</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{formatRevenue(analytics.totalRevenue)}</div>
              <div className="text-xs">Revenus</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{analytics.averageRating}/5</div>
              <div className="text-xs">Note moyenne</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{performance.onTimeRate}%</div>
              <div className="text-xs">Ponctualité</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setFilter(period)}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                    filter === period
                      ? 'bg-[#D5BDAF] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {period === 'all' ? 'Tout' : period === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des trajets */}
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun trajet trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTrips.map((tripHistory, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-green-600" size={16} />
                          <span className="font-bold">{tripHistory.trip.origin}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="text-red-600" size={16} />
                          <span className="font-bold">{tripHistory.trip.destination}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(tripHistory.trip.id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {tripHistory.trip.departureTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {tripHistory.bookingRequest.passengerCount} passager(s)
                        </div>
                        {tripHistory.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            {tripHistory.rating.rating}/5
                          </div>
                        )}
                      </div>

                      {tripHistory.rating?.comment && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                          "{tripHistory.rating.comment}"
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-xl font-black text-[#7D4F50]">
                        {formatRevenue(
                          tripHistory.trip.isPrivate 
                            ? tripHistory.trip.pricePrivate 
                            : tripHistory.trip.priceCollective
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tripHistory.trip.isPrivate ? 'Privatisation' : 'Collectif'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} trouvé{filteredTrips.length > 1 ? 's' : ''}
            </div>
            <button className="text-blue-600 font-bold hover:underline">
              Exporter les données →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedTrips;
