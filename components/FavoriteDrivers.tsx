import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Phone, Car, X, Search, Filter } from 'lucide-react';
import DriverProfile from './DriverProfile';
import { notificationService } from '../services/notificationService';

interface FavoriteDriver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  isVerified: boolean;
  hasValidLicense: boolean;
  hasInsurance: boolean;
  isTopDriver: boolean;
  upcomingTrips?: any[];
  reviews?: any[];
}

interface FavoriteDriversProps {
  onClose: () => void;
}

const FavoriteDrivers: React.FC<FavoriteDriversProps> = ({ onClose }) => {
  const [favoriteDrivers, setFavoriteDrivers] = useState<FavoriteDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<FavoriteDriver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'trips'>('rating');

  // Charger les favoris depuis le localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteDrivers');
    if (savedFavorites) {
      setFavoriteDrivers(JSON.parse(savedFavorites));
    }
  }, []);

  // Sauvegarder les favoris dans le localStorage
  const saveFavorites = (drivers: FavoriteDriver[]) => {
    localStorage.setItem('favoriteDrivers', JSON.stringify(drivers));
    setFavoriteDrivers(drivers);
  };

  // Ajouter un chauffeur aux favoris
  const addToFavorites = (driver: FavoriteDriver) => {
    const exists = favoriteDrivers.some(d => d.id === driver.id);
    if (!exists) {
      const updatedFavorites = [...favoriteDrivers, driver];
      saveFavorites(updatedFavorites);

      // Activer les notifications pour ce chauffeur
      notificationService.addNotification({
        userId: 'current_user',
        type: 'favorite_driver',
        title: '🚗 Nouveau chauffeur favori',
        message: `${driver.firstName} ${driver.lastName} a été ajouté à vos favoris. Vous recevrez des notifications pour ses nouveaux trajets.`,
        read: false
      });
    }
  };

  // Retirer un chauffeur des favoris
  const removeFromFavorites = (driverId: string) => {
    const updatedFavorites = favoriteDrivers.filter(d => d.id !== driverId);
    saveFavorites(updatedFavorites);

    // Désactiver les notifications pour ce chauffeur
    notificationService.addNotification({
      userId: 'current_user',
      type: 'favorite_driver',
      title: '💔 Chauffeur retiré',
      message: 'Le chauffeur a été retiré de vos favoris. Vous ne recevrez plus de notifications pour ses trajets.',
      read: false
    });
  };

  // Vérifier si un chauffeur est en favoris
  const isFavorite = (driverId: string) => {
    return favoriteDrivers.some(d => d.id === driverId);
  };

  // Filtrer et trier les chauffeurs
  const filteredAndSortedDrivers = favoriteDrivers
    .filter(driver => {
      const matchesSearch = `${driver.firstName} ${driver.lastName} ${driver.city}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !filterCity || driver.city.toLowerCase() === filterCity.toLowerCase();
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'rating':
          return b.rating - a.rating;
        case 'trips':
          return b.totalTrips - a.totalTrips;
        default:
          return 0;
      }
    });

  // Simuler des données de chauffeurs pour démonstration
  const sampleDrivers: FavoriteDriver[] = [
    {
      id: 'd1',
      firstName: 'Mohamed',
      lastName: 'Ben Ali',
      phone: '+216 22 123 456',
      email: 'mohamed.benali@email.com',
      city: 'Tunis',
      vehicleBrand: 'Renault',
      vehicleModel: 'Clio 4',
      vehicleYear: '2020',
      vehicleColor: 'Blanc',
      licensePlate: '123 TU 4567',
      rating: 4.8,
      totalTrips: 156,
      memberSince: 'Janvier 2023',
      isVerified: true,
      hasValidLicense: true,
      hasInsurance: true,
      isTopDriver: true,
      upcomingTrips: [
        {
          id: 't1',
          origin: 'Tunis',
          destination: 'Sousse',
          date: '2024-01-15',
          departureTime: '08:00',
          price: 25,
          availableSeats: 3,
          totalSeats: 4
        }
      ],
      reviews: [
        {
          passengerName: 'Sarra T.',
          rating: 5,
          comment: 'Excellent chauffeur, ponctuel et très aimable. Voiture propre et confortable.',
          date: '2024-01-10'
        }
      ]
    },
    {
      id: 'd2',
      firstName: 'Ahmed',
      lastName: 'Trabelsi',
      phone: '+216 98 765 432',
      email: 'ahmed.trabelsi@email.com',
      city: 'Sousse',
      vehicleBrand: 'Peugeot',
      vehicleModel: '308',
      vehicleYear: '2019',
      vehicleColor: 'Gris',
      licensePlate: '456 TU 8901',
      rating: 4.6,
      totalTrips: 89,
      memberSince: 'Mars 2023',
      isVerified: true,
      hasValidLicense: true,
      hasInsurance: true,
      isTopDriver: false,
      upcomingTrips: [],
      reviews: []
    }
  ];

  // Utiliser les données réelles ou les données de démonstration
  const displayDrivers = favoriteDrivers.length > 0 ? filteredAndSortedDrivers : sampleDrivers;

  const cities = [...new Set(displayDrivers.map(d => d.city))];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Heart size={28} />
              <h2 className="text-2xl font-black">Mes Chauffeurs Favoris</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-sm">
              Suivez vos chauffeurs préférés et recevez des notifications lorsqu'ils publient de nouveaux trajets ou lorsque des places se libèrent sur vos trajets préférés.
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un chauffeur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Toutes les villes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="rating">Trier par note</option>
              <option value="name">Trier par nom</option>
              <option value="trips">Trier par trajets</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center justify-center">
              {displayDrivers.length} chauffeur{displayDrivers.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des chauffeurs */}
        <div className="p-6 overflow-y-auto flex-1">
          {displayDrivers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDrivers.map((driver) => (
                <div key={driver.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-red-300">
                  {/* Header du chauffeur */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Car size={24} className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isFavorite(driver.id)) {
                          removeFromFavorites(driver.id);
                        } else {
                          addToFavorites(driver);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${isFavorite(driver.id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Heart size={18} className={isFavorite(driver.id) ? 'fill-red-600' : ''} />
                    </button>
                  </div>

                  {/* Informations principales */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{driver.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car size={14} />
                      <span>{driver.vehicleBrand} {driver.vehicleModel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{driver.phone}</span>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{driver.totalTrips}</div>
                      <div className="text-xs text-gray-600">Trajets</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{driver.rating}</div>
                      <div className="text-xs text-gray-600">Note</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {driver.isVerified && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Vérifié
                      </div>
                    )}
                    {driver.isTopDriver && (
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Top Driver
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/driver-profile/${driver.id}`, '_blank')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                      Voir le profil
                    </button>
                    <button
                      onClick={() => window.open(`tel:${driver.phone}`)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun chauffeur favori</h3>
              <p className="text-gray-600">
                Ajoutez des chauffeurs à vos favoris pour recevoir des notifications lorsqu'ils publient de nouveaux trajets.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {favoriteDrivers.length} chauffeur{favoriteDrivers.length > 1 ? 's' : ''} en favoris
            </div>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal du profil du chauffeur */}
      {selectedDriver && (
        <DriverProfile
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onToggleFavorite={(driverId) => {
            if (isFavorite(driverId)) {
              removeFromFavorites(driverId);
            } else {
              addToFavorites(selectedDriver);
            }
          }}
          isFavorite={isFavorite(selectedDriver.id)}
        />
      )}
    </div>
  );
};

export default FavoriteDrivers;
