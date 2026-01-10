import React, { useState } from 'react';
import { Star, MapPin, Clock, Users, AlertTriangle, Shield, Phone, MessageSquare, Navigation, X } from 'lucide-react';
import { ratingService } from '../services/ratingService';
import { gpsService } from '../services/gpsService';
import { emergencyService } from '../services/emergencyService';

interface LiveTrackingProps {
  tripId: string;
  driverId: string;
  origin: string;
  destination: string;
  estimatedTime: number;
  onTripComplete: () => void;
  onEmergency: (type: string, description: string) => void;
}

const LiveTracking: React.FC<LiveTrackingProps> = ({
  tripId,
  driverId,
  origin,
  destination,
  estimatedTime,
  onTripComplete,
  onEmergency
}) => {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isTracking, setIsTracking] = useState(true);

  // Simulation du suivi GPS
  React.useEffect(() => {
    if (!isTracking) return;

    const intervalId = gpsService.simulateGPSMovement(driverId, 3000);
    
    // Simuler la réception des positions
    const locationInterval = setInterval(() => {
      setDriverLocation({
        lat: 36.8065 + Math.random() * 0.1,
        lng: 10.1815 + Math.random() * 0.1,
        address: "En route vers votre position...",
        speed: Math.random() * 40 + 30,
        heading: Math.random() * 360
      });
    }, 3000);

    // Simuler la fin du trajet après 30 secondes
    const tripTimeout = setTimeout(() => {
      setIsTracking(false);
      setShowRatingModal(true);
    }, 30000);

    return () => {
      clearInterval(locationInterval);
      clearTimeout(tripTimeout);
      clearInterval(intervalId);
    };
  }, [driverId, isTracking]);

  const handleEmergency = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'accident': 'Accident de la route',
      'breakdown': 'Panne mécanique du véhicule',
      'medical': 'Urgence médicale',
      'security': 'Problème de sécurité'
    };

    onEmergency(type, descriptions[type] || 'Urgence');
    setShowEmergencyModal(false);
  };

  const handleSubmitRating = () => {
    if (rating === 0) return;

    ratingService.addRating({
      tripId,
      driverId,
      passengerId: 'p1', // Simplifié
      rating,
      comment
    });

    setShowRatingModal(false);
    onTripComplete();
  };

  const contactDriver = () => {
    console.log('📞 Contacting driver...');
    // Dans une vraie application, ouvrirait un appel ou messagerie
  };

  const shareLocation = () => {
    if (navigator.share && driverLocation) {
      navigator.share({
        title: 'Ma position Firqa',
        text: `Je suis en route de ${origin} vers ${destination}. Position actuelle: ${driverLocation.address}`,
        url: `https://maps.google.com/?q=${driverLocation.lat},${driverLocation.lng}`
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Carte de suivi (simulation) */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Simulation de carte */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white animate-pulse">
                <Navigation size={32} />
              </div>
              <div className="text-lg font-bold text-gray-700">Suivi en temps réel</div>
              {driverLocation && (
                <div className="text-sm text-gray-600">
                  {driverLocation.address}
                </div>
              )}
            </div>
          </div>

          {/* Bouton d'urgence */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="absolute top-4 right-4 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
          >
            <Phone size={20} />
          </button>
        </div>
      </div>

      {/* Informations du trajet */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-green-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Départ</div>
                <div className="font-bold">{origin}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-red-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Arrivée</div>
                <div className="font-bold">{destination}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Temps estimé</div>
                <div className="font-bold">{estimatedTime} minutes</div>
              </div>
            </div>
            {driverLocation && (
              <div className="flex items-center gap-3">
                <Users className="text-purple-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Vitesse</div>
                  <div className="font-bold">{Math.round(driverLocation.speed)} km/h</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={contactDriver}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={20} />
            Contacter le chauffeur
          </button>
          <button
            onClick={shareLocation}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-2xl font-bold hover:bg-green-700 transition-colors"
          >
            <Navigation size={20} />
            Partager ma position
          </button>
        </div>
      </div>

      {/* Modal d'urgence */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Signaler une urgence</h3>
              <button onClick={() => setShowEmergencyModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {emergencyService.getEmergencyTypes().map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleEmergency(type.type)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="text-2xl">{type.icon}</div>
                  <div>
                    <div className="font-bold">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-red-50 rounded-2xl">
              <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                <AlertTriangle size={20} />
                Contacts d'urgence
              </div>
              <div className="space-y-1 text-sm">
                {emergencyService.getEmergencyContacts().map(contact => (
                  <div key={contact.phone} className="flex justify-between">
                    <span>{contact.name}</span>
                    <span className="font-bold">{contact.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notation */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black mb-2">Comment s'est passé votre trajet ?</h3>
              <p className="text-gray-600">Votre avis aide la communauté Firqa</p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-colors"
                >
                  <Star
                    size={40}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience (optionnel)"
              className="w-full p-4 border border-gray-200 rounded-2xl resize-none h-24"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
              >
                Plus tard
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
