import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, MapPin, Users, DollarSign, MessageSquare, Navigation, Car } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface OnDemandRequest {
  id: string;
  type: 'on_demand' | 'private_hire';
  origin: string;
  destination: string;
  currentLocation?: string;
  passengerCount: number;
  luggageDetails: {
    sac: number;
    petiteValise: number;
    moyenneValise: number;
    grandeValise: number;
  };
  urgency: 'normal' | 'urgent' | 'immediate';
  proposedPrice?: number;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
  passengerName: string;
}

interface DriverOnDemandProps {
  driverId: string;
  onClose: () => void;
}

const DriverOnDemand: React.FC<DriverOnDemandProps> = ({ driverId, onClose }) => {
  const [requests, setRequests] = useState<OnDemandRequest[]>([
    {
      id: 'ondemand1',
      type: 'on_demand',
      origin: 'Tunis',
      destination: 'Sousse',
      currentLocation: 'Avenue Habib Bourguiba, Tunis',
      passengerCount: 2,
      luggageDetails: {
        sac: 1,
        petiteValise: 1,
        moyenneValise: 0,
        grandeValise: 0
      },
      urgency: 'urgent',
      message: 'Besoin urgent pour rejoindre un rendez-vous médical',
      timestamp: new Date().toISOString(),
      status: 'pending',
      passengerName: 'M. Ben Ali'
    },
    {
      id: 'ondemand2',
      type: 'private_hire',
      origin: 'Sfax',
      destination: 'Tunis',
      passengerCount: 4,
      luggageDetails: {
        sac: 0,
        petiteValise: 2,
        moyenneValise: 1,
        grandeValise: 1
      },
      urgency: 'normal',
      proposedPrice: 150,
      message: 'Famille avec bagages nombreux, besoin de véhicule confortable',
      timestamp: new Date().toISOString(),
      status: 'pending',
      passengerName: 'Mme. Trabelsi'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'on_demand' | 'private_hire'>('all');

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.type === filter);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' as const } : req
    ));

    const request = requests.find(r => r.id === requestId);
    if (request) {
      // Notifier le passager
      notificationService.addNotification({
        userId: 'p1',
        type: 'booking_accepted',
        title: 'Demande acceptée',
        message: `Le chauffeur a accepté votre demande: ${request.origin} → ${request.destination}`,
        read: false
      });
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'declined' as const } : req
    ));

    const request = requests.find(r => r.id === requestId);
    if (request) {
      // Notifier le passager
      notificationService.addNotification({
        userId: 'p1',
        type: 'booking_declined',
        title: 'Demande refusée',
        message: `Le chauffeur a décliné votre demande: ${request.origin} → ${request.destination}`,
        read: false
      });
    }
  };

  const formatLuggageDetails = (luggageDetails: any) => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-TN');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'Immédiat';
      case 'urgent': return 'Urgent';
      default: return 'Normal';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Navigation size={32} />
              <h2 className="text-2xl font-black">Demandes Spéciales</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{requests.length}</div>
              <div className="text-xs">Total demandes</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{requests.filter(r => r.status === 'pending').length}</div>
              <div className="text-xs">En attente</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{requests.filter(r => r.type === 'private_hire').length}</div>
              <div className="text-xs">Privatisations</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'on_demand', label: 'Louage en cours' },
              { value: 'private_hire', label: 'Privatisations' }
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value as any)}
                className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                  filter === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Navigation size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucune demande spéciale trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        request.type === 'on_demand' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {request.type === 'on_demand' ? <Navigation size={20} /> : <Car size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{request.passengerName}</div>
                        <div className="text-sm text-gray-500">
                          {request.type === 'on_demand' ? 'Louage en cours' : 'Privatisation'} • {formatTime(request.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(request.urgency)}`}>
                        {getUrgencyLabel(request.urgency)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2 text-sm">
                      {request.currentLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="text-red-500" size={14} />
                          <span className="font-medium">Position:</span>
                          <span>{request.currentLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="text-green-500" size={14} />
                        <span className="font-medium">Trajet:</span>
                        <span>{request.origin} → {request.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="text-blue-500" size={14} />
                        <span className="font-medium">Passagers:</span>
                        <span>{request.passengerCount} personne(s)</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="text-purple-500" size={14} />
                        <span className="font-medium">Bagages:</span>
                        <span>{formatLuggageDetails(request.luggageDetails)}</span>
                      </div>
                      {request.proposedPrice && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="text-green-500" size={14} />
                          <span className="font-medium">Prix proposé:</span>
                          <span className="font-bold text-green-600">{request.proposedPrice} TND</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.message && (
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <div className="flex items-center gap-2 text-blue-800 mb-1">
                        <MessageSquare size={16} />
                        <span className="font-bold text-sm">Message du passager:</span>
                      </div>
                      <p className="text-sm text-blue-700">{request.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={16} className="inline mr-2" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={16} className="inline mr-2" />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverOnDemand;
