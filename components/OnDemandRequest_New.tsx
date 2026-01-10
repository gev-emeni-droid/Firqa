import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, ChevronRight, Star, Clock, Shield, CheckCircle2, Briefcase, X, AlertCircle, Navigation, Car, Settings, Bell, Heart, User, Phone, Package, Luggage } from 'lucide-react';
import { ROUTES } from '../constants';
import { Trip, BookingRequest } from '../types';
import DriverProfile from './DriverProfile';
import FavoriteDrivers from './FavoriteDrivers';
import DirectPrivateHire from './DirectPrivateHire';
import { profileService } from '../services/profileService';
import { notificationService } from '../services/notificationService';

interface OnDemandRequestProps {
  onClose: () => void;
  onSubmit: (request: any) => void;
  requestType: 'on_demand' | 'private_hire';
}

interface FormData {
  origin: string;
  destination: string;
  pickupType: 'station' | 'precise_address';
  selectedStation: string;
  preciseAddress: string;
  dropoffType: 'station' | 'precise_address';
  selectedDropoffStation: string;
  preciseDropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  passengerCount: number;
  luggage: {
    sac: number;
    petiteValise: number;
    moyenneValise: number;
    grandeValise: number;
  };
  message: string;
}

interface DriverResponse {
  driverId: string;
  driverName: string;
  status: 'pending' | 'accepted' | 'declined';
  price?: number;
  estimatedArrival?: string;
  message?: string;
  timestamp: string;
}

const MAX_LUGGAGE_PER_TYPE: FormData['luggage'] = {
  sac: 5,
  petiteValise: 4,
  moyenneValise: 3,
  grandeValise: 2
};

const OnDemandRequest: React.FC<OnDemandRequestProps> = ({ onClose, onSubmit, requestType }) => {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    pickupType: 'precise_address',
    selectedStation: '',
    preciseAddress: '',
    dropoffType: 'station',
    selectedDropoffStation: '',
    preciseDropoffAddress: '',
    pickupDate: '',
    pickupTime: '',
    passengerCount: 1,
    luggage: {
      sac: 0,
      petiteValise: 0,
      moyenneValise: 0,
      grandeValise: 0
    },
    message: ''
  });

  const [currentLocation, setCurrentLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [driverResponses, setDriverResponses] = useState<DriverResponse[]>([]);
  const [showDriverList, setShowDriverList] = useState(false);

  const routes = [
    'Tunis', 'Sousse', 'Sfax', 'Monastir', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'La Marsa', 'Hammamet', 'Djerba'
  ];

  const stations = [
    'Station Tunis', 'Station Sousse', 'Station Sfax', 'Station Monastir', 
    'Station Djerba', 'Station Hammamet', 'Station Nabeul', 'Station Bizerte'
  ];

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationText = `Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCurrentLocation(locationText);
          setFormData(prev => ({
            ...prev,
            preciseAddress: locationText
          }));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setCurrentLocation('Impossible d\'obtenir la position');
          setIsGettingLocation(false);
        }
      );
    } else {
      setCurrentLocation('La géolocalisation n\'est pas supportée');
      setIsGettingLocation(false);
    }
  };

  const updateLuggage = (type: keyof typeof formData.luggage, delta: number) => {
    setFormData(prev => {
      const currentValue = prev.luggage[type];
      const maxValue = MAX_LUGGAGE_PER_TYPE[type];
      const nextValue = Math.max(0, Math.min(maxValue, currentValue + delta));
      if (nextValue === currentValue) {
        return prev;
      }
      return {
        ...prev,
        luggage: {
          ...prev.luggage,
          [type]: nextValue
        }
      };
    });
  };

  const getTotalLuggage = () =>
    formData.luggage.sac +
    formData.luggage.petiteValise +
    formData.luggage.moyenneValise +
    formData.luggage.grandeValise;

  // Obtenir la date minimale (aujourd'hui)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Simuler les réponses des chauffeurs
  const simulateDriverResponses = () => {
    const mockDrivers = [
      { id: 'd1', name: 'Mondher Ben Ali', rating: 4.8, vehicle: 'Peugeot 308', pricePerKm: 0.5 },
      { id: 'd2', name: 'Ali Jlassi', rating: 4.6, vehicle: 'Renault Clio', pricePerKm: 0.4 },
      { id: 'd3', name: 'Sami Trabelsi', rating: 4.9, vehicle: 'Citroën C4', pricePerKm: 0.6 }
    ];

    const responses: DriverResponse[] = [];
    
    mockDrivers.forEach((driver, index) => {
      setTimeout(() => {
        const status: DriverResponse['status'] = Math.random() > 0.3 ? 'accepted' : 'declined';
        const response: DriverResponse = {
          driverId: driver.id,
          driverName: driver.name,
          status,
          price: status === 'declined' ? 0 : Math.floor(Math.random() * 20) + 5,
          estimatedArrival: `${Math.floor(Math.random() * 15) + 5} min`,
          message: status === 'declined' ? 'Non disponible actuellement' : 'Je suis disponible pour cette course',
          timestamp: new Date().toISOString()
        };
        
        setDriverResponses(prev => [...prev, response]);
        
        // Envoyer la notification au passager
        notificationService.addNotification({
          userId: 'current_passenger',
          type: response.status === 'accepted' ? 'booking_accepted' : 'booking_declined',
          title: response.status === 'accepted' ? '🚗 Chauffeur accepté !' : '❌ Chauffeur indisponible',
          message: `${response.driverName} a ${response.status === 'accepted' ? 'accepté' : 'refusé'} votre demande${response.price ? ` - ${response.price} TND` : ''}`,
          read: false
        });
      }, (index + 1) * 2000); // Simuler des réponses toutes les 2 secondes
    });
    
    setShowDriverList(true);
  };

  const handleSubmit = () => {
    if (!formData.origin || !formData.destination) {
      alert('Veuillez remplir les lieux de départ et de destination');
      return;
    }

    if (requestType === 'on_demand' && !formData.preciseAddress) {
      alert('Veuillez indiquer votre adresse précise pour le louage en chemin');
      return;
    }

    if (!formData.pickupDate || !formData.pickupTime) {
      alert('Veuillez sélectionner la date et l\'heure de récupération');
      return;
    }

    if (formData.passengerCount < 1 || formData.passengerCount > 8) {
      alert('Le nombre de passagers doit être entre 1 et 8');
      return;
    }

    const finalRequest = {
      ...formData,
      type: requestType,
      pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}`,
      requiresQuotation: true
    };

    // Envoyer la notification aux chauffeurs
    const notificationTitle = requestType === 'on_demand' ? '🚗 Demande de louage en chemin' : '🔒 Demande de privatisation';
    const notificationMessage = `Demande de ${formData.origin} → ${formData.destination} le ${formData.pickupDate} à ${formData.pickupTime} (${formData.passengerCount} passagers, ${getTotalLuggage()} bagages)`;

    notificationService.addNotification({
      userId: 'all_drivers',
      type: 'booking_request',
      title: notificationTitle,
      message: notificationMessage,
      read: false
    });

    // Simuler les réponses des chauffeurs
    simulateDriverResponses();

    onSubmit(finalRequest);
    onClose();
  };

  const acceptDriverOffer = (driverResponse: DriverResponse) => {
    // Envoyer la notification d'acceptation au chauffeur
    notificationService.addNotification({
      userId: driverResponse.driverId,
      type: 'booking_accepted',
      title: '✅ Réservation acceptée!',
      message: `Le passager a accepté votre offre de ${driverResponse.price} TND pour la course ${formData.origin} → ${formData.destination}`,
      read: false
    });

    // Retirer le chauffeur de la liste des réponses
    setDriverResponses(prev => prev.filter(r => r.driverId !== driverResponse.driverId));
    
    if (driverResponses.length === 0) {
      setShowDriverList(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Navigation size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {requestType === 'on_demand' ? 'Louage en chemin' : 'Privatisation'}
                </h2>
                <p className="text-white/80 text-sm">
                  {requestType === 'on_demand' 
                    ? 'Rejoignez un chauffeur sur son trajet' 
                    : 'Réservez votre véhicule personnel'
                  }
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Lieux */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Lieux du trajet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-green-500" size={14} />
                    Départ *
                  </label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {routes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-red-500" size={14} />
                    Destination *
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {routes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Position actuelle */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Navigation className="text-purple-500" size={14} />
                  Position actuelle *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.preciseAddress}
                    onChange={(e) => setFormData({...formData, preciseAddress: e.target.value})}
                    placeholder="Adresse complète pour la récupération..."
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#D5BDAF]/20 hover:bg-[#D5BDAF]/40 rounded-full transition-colors"
                    title="Utiliser ma position actuelle"
                  >
                    {isGettingLocation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    ) : (
                      <Navigation size={16} className="text-[#B08968]" />
                    )}
                  </button>
                </div>
                {currentLocation && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    📍 {currentLocation}
                  </div>
                )}
              </div>

              {/* Date et heure */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Date et heure de récupération</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Calendar className="text-purple-500" size={14} />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                      min={getMinDate()}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Clock className="text-purple-500" size={14} />
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Passagers et bagages */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Détails du voyage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Users size={14} />
                      Passagers *
                    </label>
                    <select
                      value={formData.passengerCount}
                      onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bagages */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Briefcase size={14} />
                    Bagages
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'sac', label: 'Sac', price: 2 },
                      { key: 'petiteValise', label: 'Petite valise', price: 5 },
                      { key: 'moyenneValise', label: 'Moyenne valise', price: 8 },
                      { key: 'grandeValise', label: 'Grande valise', price: 12 }
                    ].map((type) => {
                      const currentValue = formData.luggage[type.key as keyof typeof formData.luggage];
                      const maxValue = MAX_LUGGAGE_PER_TYPE[type.key as keyof typeof formData.luggage];
                      return (
                        <div key={type.key} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <span className="text-sm font-bold">{type.label}</span>
                          <span className="text-xs text-gray-500">({type.price} TND) — max {maxValue}</span>
                          <button
                            onClick={() => updateLuggage(type.key as any, -1)}
                            className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {currentValue}
                          </span>
                          <button
                            onClick={() => updateLuggage(type.key as any, 1)}
                            className={`w-6 h-6 rounded text-xs ${currentValue >= maxValue ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            disabled={currentValue >= maxValue}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {getTotalLuggage()} article{getTotalLuggage() > 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Message pour le chauffeur
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Précisez les détails importants de votre demande..."
                    rows={3}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Information sur le devis */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="text-orange-600" />
                  <div>
                    <h4 className="font-bold text-orange-900 mb-2">Demande envoyée aux chauffeurs</h4>
                    <p className="text-sm text-orange-700">
                      Les chauffeurs de votre région recevront votre demande et pourront vous répondre avec leurs propositions.
                    </p>
                    <p className="text-sm text-orange-700">
                      Vous recevrez une notification dès qu'un chauffeur répondra à votre demande.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnDemandRequest;
