import React, { useState } from 'react';
import { X, Star, MapPin, Phone, Mail, Car, Calendar, Award, Heart, Clock, CheckCircle, AlertCircle, Shield, Users, User, Navigation } from 'lucide-react';

interface DriverProfileProps {
  driver: any;
  onClose: () => void;
  onToggleFavorite: (driverId: string) => void;
  isFavorite: boolean;
  onRequestPrivateHire?: (driver: any) => void;
}

const DriverProfile: React.FC<DriverProfileProps> = ({ driver, onClose, onToggleFavorite, isFavorite, onRequestPrivateHire }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'trips' | 'reviews'>('info');

  const averageRating = driver.reviews?.length > 0
    ? driver.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / driver.reviews.length
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={18} />
                    Informations personnelles
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Nom:</span>
                      <span className="font-medium">{driver.firstName} {driver.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm">{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm">{driver.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm">{driver.city}, Tunisie</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Car size={18} />
                    Véhicule
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Véhicule:</span>
                      <span className="font-medium">{driver.vehicleBrand} {driver.vehicleModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Année:</span>
                      <span className="font-medium">{driver.vehicleYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Couleur:</span>
                      <span className="font-medium">{driver.vehicleColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Immatriculation:</span>
                      <span className="font-medium">{driver.licensePlate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={18} />
                Statistiques et performance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{driver.totalTrips || 0}</div>
                  <div className="text-xs text-gray-600">Trajets effectués</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{driver.totalPassengers || 0}</div>
                  <div className="text-xs text-gray-600">Passagers transportés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{driver.yearsExperience || 0}</div>
                  <div className="text-xs text-gray-600">Années d'expérience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{driver.completionRate || 0}%</div>
                  <div className="text-xs text-gray-600">Taux de complétion</div>
                </div>
              </div>
            </div>

            {/* Badges et vérifications */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={18} />
                Vérifications et badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {driver.isVerified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Identité vérifiée
                  </div>
                )}
                {driver.hasValidLicense && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Permis valide
                  </div>
                )}
                {driver.hasInsurance && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Assurance à jour
                  </div>
                )}
                {driver.isTopDriver && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    <Award size={12} />
                    Top Driver
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'trips':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} />
              Trajets disponibles
            </h4>
            <div className="space-y-3">
              {driver.upcomingTrips?.length > 0 ? (
                driver.upcomingTrips.map((trip: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-2">
                          {trip.origin} → {trip.destination}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {trip.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {trip.departureTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {trip.availableSeats}/{trip.totalSeats} places
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{trip.price} TND</div>
                        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Aucun trajet disponible pour le moment</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Star size={18} />
                Avis des passagers
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(averageRating)}
                </div>
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">({driver.reviews?.length || 0} avis)</span>
              </div>
            </div>

            <div className="space-y-3">
              {driver.reviews?.length > 0 ? (
                driver.reviews.map((review: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{review.passengerName}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Aucun avis pour le moment</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex flex-col md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black">{driver.firstName} {driver.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {renderStars(averageRating)}
                  </div>
                  <span className="text-sm">({averageRating.toFixed(1)})</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onToggleFavorite(driver.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isFavorite
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Heart size={18} className={isFavorite ? 'fill-red-600' : ''} />
                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>

              {isFavorite && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  <CheckCircle size={12} />
                  Notifications activées
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Membre depuis {driver.memberSince}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'info', label: 'Informations', icon: User },
            { id: 'trips', label: 'Trajets', icon: Calendar },
            { id: 'reviews', label: 'Avis', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderTabContent()}
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 gap-3">
            {onRequestPrivateHire && (
              <button
                onClick={() => onRequestPrivateHire(driver)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                Demander une privatisation
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open(`tel:${driver.phone}`)}
                className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Contacter
              </button>
              <button
                onClick={() => window.open(`mailto:${driver.email}`)}
                className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Envoyer un message
              </button>
            </div>
            <button
              onClick={() => onToggleFavorite(driver.id)}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isFavorite
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Heart size={18} className={isFavorite ? 'fill-red-500' : ''} />
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
