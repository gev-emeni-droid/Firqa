import React, { useState, useEffect } from 'react';
import { X, User, Clock, MapPin, Star, Phone, CheckCircle2, AlertCircle, Navigation, Car, DollarSign, Users } from 'lucide-react';

interface DriverResponse {
  driverId: string;
  driverName: string;
  status: 'pending' | 'accepted' | 'declined';
  price?: number;
  estimatedArrival?: string;
  message?: string;
  timestamp: string;
  rating?: number;
  vehicle?: string;
  avatar?: string;
}

interface DriverResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  responses: DriverResponse[];
  onAcceptDriver: (driver: DriverResponse) => void;
  requestDetails: {
    origin: string;
    destination: string;
    pickupDate: string;
    pickupTime: string;
    passengerCount: number;
    luggageCount: number;
  };
}

const DriverResponsesModal: React.FC<DriverResponsesModalProps> = ({
  isOpen,
  onClose,
  responses,
  onAcceptDriver,
  requestDetails
}) => {
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(null);

  if (!isOpen) return null;

  const acceptedDrivers = responses.filter(r => r.status === 'accepted');
  const declinedDrivers = responses.filter(r => r.status === 'declined');

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortByPriceAndArrival = (drivers: DriverResponse[]) => {
    return drivers.sort((a, b) => {
      // Prioriser les prix plus bas
      if (a.price && b.price) {
        return a.price - b.price;
      }
      // Si pas de prix, prioriser l'arrivée la plus rapide
      if (a.estimatedArrival && b.estimatedArrival) {
        return parseInt(a.estimatedArrival) - parseInt(b.estimatedArrival);
      }
      return 0;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Car size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Réponses des chauffeurs</h2>
                <p className="text-white/80 text-sm">
                  {acceptedDrivers.length} chauffeur{acceptedDrivers.length > 1 ? 's' : ''} disponible{acceptedDrivers.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Détails de la demande */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-green-500" />
              <span className="font-medium">{requestDetails.origin}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-red-500" />
              <span className="font-medium">{requestDetails.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              <span className="font-medium">{requestDetails.pickupTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-purple-500" />
              <span className="font-medium">{requestDetails.passengerCount} passagers</span>
            </div>
          </div>
        </div>

        {/* Liste des chauffeurs */}
        <div className="p-6 overflow-y-auto flex-1">
          {acceptedDrivers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">En attente de réponses...</h3>
              <p className="text-gray-600 mb-4">
                Les chauffeurs de votre région reçoivent votre demande et vous répondront prochainement.
              </p>
              <div className="text-sm text-gray-500">
                {declinedDrivers.length > 0 && (
                  <p>{declinedDrivers.length} chauffeur{declinedDrivers.length > 1 ? 's' : ''} a{declinedDrivers.length > 1 ? 'ont' : ''} décliné la demande</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Chauffeurs disponibles ({acceptedDrivers.length})
              </h3>
              
              {sortByPriceAndArrival(acceptedDrivers).map((driver, index) => (
                <div key={driver.driverId} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar du chauffeur */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        {driver.avatar ? (
                          <img src={driver.avatar} alt={driver.driverName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={32} className="text-blue-600" />
                        )}
                      </div>
                      
                      {/* Informations du chauffeur */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-gray-900">{driver.driverName}</h4>
                          {driver.rating && (
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                              <Star size={12} className="text-yellow-600 fill-current" />
                              <span className="text-xs font-bold text-yellow-700">{driver.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          {driver.vehicle && (
                            <div className="flex items-center gap-1">
                              <Car size={14} />
                              <span>{driver.vehicle}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Arrivée: {driver.estimatedArrival}</span>
                          </div>
                        </div>
                        
                        {driver.message && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                            "{driver.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Prix et actions */}
                    <div className="text-right">
                      {driver.price && (
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-green-600">{driver.price} TND</div>
                          <div className="text-xs text-gray-500">Prix proposé</div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onAcceptDriver(driver)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Accepter
                        </button>
                        
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Phone size={16} />
                          Contacter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Chauffeurs ayant décliné */}
          {declinedDrivers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-500 mb-3">
                Chauffeurs indisponibles ({declinedDrivers.length})
              </h4>
              <div className="space-y-2">
                {declinedDrivers.map((driver) => (
                  <div key={driver.driverId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">{driver.driverName}</div>
                        <div className="text-xs text-gray-500">{formatTime(driver.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-red-600 font-medium">
                      {driver.message || 'Indisponible'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              Fermer
            </button>
            {acceptedDrivers.length > 0 && (
              <button
                onClick={() => {
                  // Accepter le meilleur offre (prix le plus bas ou arrivée la plus rapide)
                  const bestDriver = sortByPriceAndArrival(acceptedDrivers)[0];
                  onAcceptDriver(bestDriver);
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Accepter la meilleure offre
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverResponsesModal;
