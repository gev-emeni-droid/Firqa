import React, { useState } from 'react';
import { X, MapPin, Navigation, Clock, Users, Briefcase, AlertCircle, Car, Calendar } from 'lucide-react';
import { profileService } from '../services/profileService';
import { notificationService } from '../services/notificationService';

interface DirectPrivateHireProps {
  driver: any;
  onClose: () => void;
  onSubmit: (request: any) => void;
}

interface FormData {
  origin: string;
  destination: string;
  pickupType: 'station' | 'precise_address';
  selectedStation: string;
  precisePickupAddress: string;
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

const DirectPrivateHire: React.FC<DirectPrivateHireProps> = ({ driver, onClose, onSubmit }) => {
  const driverProfile = profileService.getProfile(driver.id);
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    pickupType: 'station',
    selectedStation: '',
    precisePickupAddress: '',
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

  const routes = [
    'Tunis', 'Sousse', 'Sfax', 'Monastir', 'Djerba', 'Hammamet', 'Nabeul', 'Bizerte',
    'Kairouan', 'Gabès', 'Ariana', 'Ben Arous', 'Mannouba', 'Zaghouan', 'Siliana'
  ];

  const stations = [
    'Station Tunis', 'Station Sousse', 'Station Sfax', 'Station Monastir',
    'Station Djerba', 'Station Hammamet', 'Station Nabeul', 'Station Bizerte'
  ];

  const calculateDetailedPrice = () => {
    if (!formData.origin || !formData.destination) return null;

    const matchedPrice = driverProfile?.privatizationPrices?.find(
      p => p.origin === formData.origin && p.destination === formData.destination
    );

    if (!matchedPrice) return null;

    const basePrice = matchedPrice.basePrice;

    // Simulation de frais kilométriques (même logique que PricingManager)
    const cityDistances: { [key: string]: { [key: string]: number } } = {
      'Tunis': { 'Sousse': 140, 'Sfax': 270, 'Djerba': 500, 'Monastir': 160, 'Hammamet': 65, 'Nabeul': 65, 'Bizerte': 65 },
      'Sousse': { 'Tunis': 140, 'Sfax': 130, 'Djerba': 360, 'Monastir': 20, 'Hammamet': 75, 'Nabeul': 75, 'Bizerte': 200 },
      'Sfax': { 'Tunis': 270, 'Sousse': 130, 'Djerba': 230, 'Monastir': 150, 'Hammamet': 200, 'Nabeul': 200, 'Bizerte': 330 },
      'Djerba': { 'Tunis': 500, 'Sousse': 360, 'Sfax': 230, 'Monastir': 340, 'Hammamet': 435, 'Nabeul': 435, 'Bizerte': 560 }
    };

    const distance = cityDistances[formData.origin]?.[formData.destination] || 100;
    const kilometricRate = 0.5;

    const pickupFee = formData.pickupType === 'precise_address' ? (distance * kilometricRate) : 0;
    const dropoffFee = formData.dropoffType === 'precise_address' ? (distance * kilometricRate) : 0;

    const subtotal = basePrice + pickupFee + dropoffFee;
    const serviceFee = subtotal * 0.15;
    const total = subtotal + serviceFee;

    return {
      basePrice,
      pickupFee,
      dropoffFee,
      serviceFee,
      total
    };
  };

  const detailedPrice = calculateDetailedPrice();

  const handleSubmit = () => {
    if (!formData.origin || !formData.destination) {
      alert('Veuillez remplir les lieux de départ et de destination');
      return;
    }

    if (!formData.pickupDate || !formData.pickupTime) {
      alert('Veuillez sélectionner la date et l\'heure de récupération');
      return;
    }

    if (formData.pickupType === 'station' && !formData.selectedStation) {
      alert('Veuillez sélectionner une station de récupération');
      return;
    }

    if (formData.pickupType === 'precise_address' && !formData.precisePickupAddress) {
      alert('Veuillez indiquer votre adresse précise de récupération');
      return;
    }

    if (formData.dropoffType === 'station' && !formData.selectedDropoffStation) {
      alert('Veuillez sélectionner une station de dépose');
      return;
    }

    if (formData.dropoffType === 'precise_address' && !formData.preciseDropoffAddress) {
      alert('Veuillez indiquer votre adresse précise de dépose');
      return;
    }

    const finalRequest = {
      ...formData,
      type: 'direct_private_hire',
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}`,
      totalPrice: detailedPrice?.total || 0,
      priceBreakdown: detailedPrice,
      requiresQuotation: !detailedPrice
    };

    // Envoyer la notification au chauffeur
    const notificationTitle = detailedPrice
      ? `🔒 Nouvelle privatisation (${detailedPrice.total.toFixed(0)} TND)`
      : '🔒 Demande de privatisation directe';

    const notificationMessage = `Demande de ${formData.origin} → ${formData.destination} le ${formData.pickupDate} à ${formData.pickupTime}. Prix calculé: ${detailedPrice ? detailedPrice.total.toFixed(2) + ' TND' : 'À définir'}`;

    notificationService.addNotification({
      userId: driver.id,
      type: 'booking_request',
      title: notificationTitle,
      message: notificationMessage,
      read: false
    });

    onSubmit(finalRequest);
    onClose();
  };

  const updateLuggage = (type: keyof typeof formData.luggage, delta: number) => {
    setFormData(prev => ({
      ...prev,
      luggage: {
        ...prev.luggage,
        [type]: Math.max(0, Math.min(10, prev.luggage[type] + delta))
      }
    }));
  };

  const getTotalLuggage = () => {
    return formData.luggage.sac + formData.luggage.petiteValise + formData.luggage.moyenneValise + formData.luggage.grandeValise;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <Navigation size={24} />
              <div>
                <h2 className="text-xl font-black">Privatisation Directe</h2>
                <p className="text-sm text-white/80">Chauffeur: {driver.firstName} {driver.lastName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs">
              {detailedPrice
                ? "Le prix a été calculé automatiquement selon les tarifs configurés par ce chauffeur."
                : "Ce chauffeur n'a pas configuré de tarif pour cette route. Vous recevrez son devis personnalisé."}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* Lieux */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-900">Lieux du trajet</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-green-500" size={14} />
                    Départ *
                  </label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
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
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {routes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type de récupération */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Car className="text-purple-500" size={14} />
                  Lieu de récupération *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, pickupType: 'station' })}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${formData.pickupType === 'station'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-bold">Station</div>
                    <div className="text-xs opacity-75">Pas de frais km</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, pickupType: 'precise_address' })}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${formData.pickupType === 'precise_address'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-bold">Adresse précise</div>
                    <div className="text-xs opacity-75">Frais km selon chauffeur</div>
                  </button>
                </div>
              </div>

              {/* Station sélectionnée */}
              {formData.pickupType === 'station' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-purple-500" size={14} />
                    Station de récupération *
                  </label>
                  <select
                    value={formData.selectedStation}
                    onChange={(e) => setFormData({ ...formData, selectedStation: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Adresse précise */}
              {formData.pickupType === 'precise_address' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-purple-500" size={14} />
                    Adresse précise de récupération *
                  </label>
                  <input
                    type="text"
                    value={formData.precisePickupAddress}
                    onChange={(e) => setFormData({ ...formData, precisePickupAddress: e.target.value })}
                    placeholder="Adresse complète pour la récupération..."
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertCircle size={12} className="inline mr-1" />
                    Frais kilométriques supplémentaires selon le chauffeur
                  </div>
                </div>
              )}

              {/* Type de dépose */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Car className="text-purple-500" size={14} />
                  Lieu de dépose *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, dropoffType: 'station' })}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${formData.dropoffType === 'station'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-bold">Station</div>
                    <div className="text-xs opacity-75">Pas de frais km</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, dropoffType: 'precise_address' })}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${formData.dropoffType === 'precise_address'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-bold">Adresse précise</div>
                    <div className="text-xs opacity-75">Frais km selon chauffeur</div>
                  </button>
                </div>
              </div>

              {/* Station de dépose sélectionnée */}
              {formData.dropoffType === 'station' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-purple-500" size={14} />
                    Station de dépose *
                  </label>
                  <select
                    value={formData.selectedDropoffStation}
                    onChange={(e) => setFormData({ ...formData, selectedDropoffStation: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Adresse précise de dépose */}
              {formData.dropoffType === 'precise_address' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-purple-500" size={14} />
                    Adresse précise de dépose *
                  </label>
                  <input
                    type="text"
                    value={formData.preciseDropoffAddress}
                    onChange={(e) => setFormData({ ...formData, preciseDropoffAddress: e.target.value })}
                    placeholder="Adresse complète pour la dépose..."
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertCircle size={12} className="inline mr-1" />
                    Frais kilométriques supplémentaires selon le chauffeur
                  </div>
                </div>
              )}
            </div>

            {/* Date et heure */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-900">Date et heure de récupération</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="text-purple-500" size={14} />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Passagers et bagages */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-900">Détails du voyage</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users size={14} />
                    Passagers *
                  </label>
                  <select
                    value={formData.passengerCount}
                    onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
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
                  Bagages <span className="text-green-600">(Gratuits pour privatisation)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'sac', label: 'Sac' },
                    { key: 'petiteValise', label: 'Petite valise' },
                    { key: 'moyenneValise', label: 'Moyenne valise' },
                    { key: 'grandeValise', label: 'Grande valise' }
                  ].map((type) => (
                    <div key={type.key} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm font-bold">{type.label}</span>
                      <button
                        onClick={() => updateLuggage(type.key as any, -1)}
                        className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {formData.luggage[type.key as keyof typeof formData.luggage]}
                      </span>
                      <button
                        onClick={() => updateLuggage(type.key as any, 1)}
                        className="w-6 h-6 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  ))}
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
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Précisez les détails importants de votre demande..."
                  rows={3}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Récapitulatif du prix */}
            {detailedPrice ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-3 transition-all">
                <h4 className="font-black text-green-900 border-b border-green-200 pb-2">Détail du prix total</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Prix de base route ({formData.origin}-{formData.destination}):</span>
                    <span className="font-bold">{detailedPrice.basePrice.toFixed(2)} TND</span>
                  </div>
                  {detailedPrice.pickupFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700 font-medium">Extra: Adresse de prise en charge:</span>
                      <span className="font-bold">+{detailedPrice.pickupFee.toFixed(2)} TND</span>
                    </div>
                  )}
                  {detailedPrice.dropoffFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700 font-medium">Extra: Adresse de dépose:</span>
                      <span className="font-bold">+{detailedPrice.dropoffFee.toFixed(2)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
                    <span className="text-green-700">Frais de service Firqa (15%):</span>
                    <span className="font-bold">+{detailedPrice.serviceFee.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-green-900 pt-2">
                    <span>TOTAL À RÉGLER:</span>
                    <span>{detailedPrice.total.toFixed(2)} TND</span>
                  </div>
                </div>
              </div>
            ) : formData.origin && formData.destination ? (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="text-orange-600" />
                  <div>
                    <h4 className="font-bold text-orange-900 mb-2">Devis personnalisé requis</h4>
                    <p className="text-sm text-orange-700">
                      Le chauffeur n'a pas encore configuré de tarif pour cette route. Il vous enverra un devis après réception de votre demande.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            {detailedPrice ? `Réserver pour ${detailedPrice.total.toFixed(0)} TND` : "Demander un devis"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectPrivateHire;
