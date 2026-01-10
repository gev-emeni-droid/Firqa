import React, { useState } from 'react';
import { X, Lock, Users, Calendar, Clock, DollarSign, Star, TrendingUp, Filter, Search, Edit2, Save, Plus } from 'lucide-react';

interface PrivateTrip {
  id: string;
  clientName: string;
  clientPhone: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  returnTime?: string;
  price: number;
  passengers: number;
  luggage: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  rating?: number;
  revenue: number;
}

interface PrivateTripsProps {
  driverId: string;
  onClose: () => void;
}

const PrivateTrips: React.FC<PrivateTripsProps> = ({ driverId, onClose }) => {
  const [trips, setTrips] = useState<PrivateTrip[]>([
    {
      id: 'priv1',
      clientName: 'Famille Ben Salem',
      clientPhone: '+216 23 456 789',
      origin: 'Tunis',
      destination: 'Djerba',
      departureDate: '2023-11-15',
      departureTime: '08:00',
      returnDate: '2023-11-18',
      returnTime: '18:00',
      price: 450,
      passengers: 4,
      luggage: 6,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2023-10-25',
      revenue: 450
    },
    {
      id: 'priv2',
      clientName: 'Entreprise TechTunis',
      clientPhone: '+216 98 765 432',
      origin: 'Tunis',
      destination: 'Sfax',
      departureDate: '2023-11-20',
      departureTime: '14:00',
      price: 280,
      passengers: 3,
      luggage: 4,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2023-10-28',
      specialRequests: 'Arrêt à Sousse pour déjeuner',
      revenue: 0
    },
    {
      id: 'priv3',
      clientName: 'Touristes Français',
      clientPhone: '+216 55 123 456',
      origin: 'Aéroport Tunis',
      destination: 'Hammamet',
      departureDate: '2023-10-20',
      departureTime: '10:30',
      price: 120,
      passengers: 2,
      luggage: 3,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2023-10-15',
      rating: 5,
      revenue: 120
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<PrivateTrip | null>(null);
  const [formData, setFormData] = useState<Partial<PrivateTrip>>({
    clientName: '',
    clientPhone: '',
    origin: 'Tunis',
    destination: 'Sousse',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    price: 0,
    passengers: 1,
    luggage: 0,
    specialRequests: ''
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = searchTerm === '' || 
      trip.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && trip.status === filter;
  });

  const handleCreateTrip = () => {
    const newTrip: PrivateTrip = {
      id: `priv${Date.now()}`,
      clientName: formData.clientName || '',
      clientPhone: formData.clientPhone || '',
      origin: formData.origin || 'Tunis',
      destination: formData.destination || 'Sousse',
      departureDate: formData.departureDate || '',
      departureTime: formData.departureTime || '',
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
      price: formData.price || 0,
      passengers: formData.passengers || 1,
      luggage: formData.luggage || 0,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      specialRequests: formData.specialRequests,
      revenue: 0
    };

    setTrips([...trips, newTrip]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateTrip = () => {
    if (!editingTrip) return;

    setTrips(trips.map(t => 
      t.id === editingTrip.id 
        ? { ...t, ...formData }
        : t
    ));
    setEditingTrip(null);
    resetForm();
  };

  const handleUpdateStatus = (id: string, status: PrivateTrip['status']) => {
    setTrips(trips.map(t => {
      if (t.id === id) {
        const updatedTrip = { ...t, status };
        if (status === 'completed' && t.paymentStatus === 'paid') {
          updatedTrip.revenue = t.price;
        }
        return updatedTrip;
      }
      return t;
    }));
  };

  const handleUpdatePaymentStatus = (id: string, paymentStatus: PrivateTrip['paymentStatus']) => {
    setTrips(trips.map(t => {
      if (t.id === id) {
        const updatedTrip = { ...t, paymentStatus };
        if (paymentStatus === 'paid' && t.status === 'completed') {
          updatedTrip.revenue = t.price;
        } else if (paymentStatus === 'refunded') {
          updatedTrip.revenue = 0;
        }
        return updatedTrip;
      }
      return t;
    }));
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      origin: 'Tunis',
      destination: 'Sousse',
      departureDate: '',
      departureTime: '',
      returnDate: '',
      returnTime: '',
      price: 0,
      passengers: 1,
      luggage: 0,
      specialRequests: ''
    });
  };

  const openEditModal = (trip: PrivateTrip) => {
    setEditingTrip(trip);
    setFormData(trip);
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
  const confirmedTrips = trips.filter(t => t.status === 'confirmed').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Mes privatisations</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{trips.length}</div>
              <div className="text-xs">Total privatisations</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{confirmedTrips}</div>
              <div className="text-xs">Confirmées</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{completedTrips}</div>
              <div className="text-xs">Terminées</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{formatRevenue(totalRevenue)}</div>
              <div className="text-xs">Revenus générés</div>
            </div>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un client ou une destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                    filter === status
                      ? 'bg-[#D5BDAF] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'Tout' : 
                   status === 'pending' ? 'En attente' :
                   status === 'confirmed' ? 'Confirmé' : 'Terminé'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nouvelle privatisation
            </button>
          </div>
        </div>

        {/* Liste des privatisations */}
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Lock size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucune privatisation trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTrips.map((trip) => (
                <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{trip.clientName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trip.status)}`}>
                        {getStatusLabel(trip.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trip.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        trip.paymentStatus === 'refunded' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trip.paymentStatus === 'paid' ? 'Payé' :
                         trip.paymentStatus === 'refunded' ? 'Remboursé' : 'En attente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(trip)}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Lock className="text-blue-600" size={14} />
                        <span className="font-medium">Trajet:</span>
                        <span>{trip.origin} → {trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-green-600" size={14} />
                        <span className="font-medium">Départ:</span>
                        <span>{formatDate(trip.departureDate)} à {trip.departureTime}</span>
                      </div>
                      {trip.returnDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="text-orange-600" size={14} />
                          <span className="font-medium">Retour:</span>
                          <span>{formatDate(trip.returnDate)} à {trip.returnTime}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="text-purple-600" size={14} />
                        <span className="font-medium">Passagers:</span>
                        <span>{trip.passengers} personnes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-green-600" size={14} />
                        <span className="font-medium">Prix:</span>
                        <span className="font-bold">{formatRevenue(trip.price)}</span>
                      </div>
                      {trip.rating && (
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">Note:</span>
                          <span>{trip.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {trip.specialRequests && (
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">Demandes spéciales:</div>
                      <div className="text-sm text-blue-700">{trip.specialRequests}</div>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div className="flex gap-2">
                    {trip.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(trip.id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(trip.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                    {trip.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(trip.id, 'in_progress')}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                      >
                        Démarrer
                      </button>
                    )}
                    {trip.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(trip.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                      >
                        Terminer
                      </button>
                    )}
                    {trip.paymentStatus === 'pending' && trip.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(trip.id, 'paid')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                      >
                        Marquer payé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de création/modification */}
        {(showCreateModal || editingTrip) && (
          <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-black mb-6">
                {editingTrip ? 'Modifier la privatisation' : 'Nouvelle privatisation'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom du client</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      placeholder="Nom complet"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      placeholder="+216 XX XXX XXX"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Départ</label>
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    >
                      <option value="Tunis">Tunis</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Djerba">Djerba</option>
                      <option value="Hammamet">Hammamet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destination</label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    >
                      <option value="Sousse">Sousse</option>
                      <option value="Tunis">Tunis</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Djerba">Djerba</option>
                      <option value="Hammamet">Hammamet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date de départ</label>
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Heure de départ</label>
                    <input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date de retour (optionnel)</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Heure de retour (optionnel)</label>
                    <input
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prix (TND)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Passagers</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.passengers}
                      onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bagages</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.luggage}
                      onChange={(e) => setFormData({...formData, luggage: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Demandes spéciales</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Arrêts, préférences, etc."
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTrip(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingTrip ? handleUpdateTrip : handleCreateTrip}
                  className="flex-1 bg-[#D5BDAF] text-white py-3 rounded-xl font-bold hover:bg-[#B08968] transition-colors"
                >
                  <Save size={20} className="inline mr-2" />
                  {editingTrip ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateTrips;
