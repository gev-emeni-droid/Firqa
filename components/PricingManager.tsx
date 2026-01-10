import React, { useState } from 'react';
import { X, DollarSign, Edit2, Save, TrendingUp, AlertTriangle, Info, Calculator } from 'lucide-react';
import { profileService } from '../services/profileService';
import { RoutePrivatePrice } from '../types';

interface PricingManagerProps {
  driverId: string;
  onClose: () => void;
}

const PricingManager: React.FC<PricingManagerProps> = ({ driverId, onClose }) => {
  const profile = profileService.getProfile(driverId);
  const [activeTab, setActiveTab] = useState<'routes'>('routes');
  const [routePrivatePrices, setRoutePrivatePrices] = useState<RoutePrivatePrice[]>(
    profile?.privatizationPrices || []
  );
  const [newRoutePrice, setNewRoutePrice] = useState<RoutePrivatePrice>({
    id: '',
    origin: '',
    destination: '',
    basePrice: 0
  });

  const handleSaveAll = () => {
    profileService.updateProfile(driverId, {
      privatizationPrices: routePrivatePrices
    });
    alert('Tarifs enregistrés avec succès !');
  };

  const handleAddRoutePrice = () => {
    if (newRoutePrice.origin && newRoutePrice.destination && newRoutePrice.basePrice > 0) {
      const newPrice = {
        ...newRoutePrice,
        id: Date.now().toString()
      };
      const updatedPrices = [...routePrivatePrices, newPrice];
      setRoutePrivatePrices(updatedPrices);
      setNewRoutePrice({
        id: '',
        origin: '',
        destination: '',
        basePrice: 0
      });
    }
  };

  const handleDeleteRoutePrice = (id: string) => {
    const updatedPrices = routePrivatePrices.filter(price => price.id !== id);
    setRoutePrivatePrices(updatedPrices);
  };

  const handleUpdateRoutePrice = (id: string, field: keyof RoutePrivatePrice, value: any) => {
    const updatedPrices = routePrivatePrices.map(price =>
      price.id === id ? { ...price, [field]: value } : price
    );
    setRoutePrivatePrices(updatedPrices);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  // Fonction pour calculer automatiquement les frais kilométriques
  const calculateKilometricFees = (origin: string, destination: string) => {
    // Simulation de calcul de distance (à remplacer avec une vraie API de géolocalisation)
    const cityDistances: { [key: string]: { [key: string]: number } } = {
      'Tunis': { 'Sousse': 140, 'Sfax': 270, 'Djerba': 500, 'Monastir': 160, 'Hammamet': 65, 'Nabeul': 65, 'Bizerte': 65 },
      'Sousse': { 'Tunis': 140, 'Sfax': 130, 'Djerba': 360, 'Monastir': 20, 'Hammamet': 75, 'Nabeul': 75, 'Bizerte': 200 },
      'Sfax': { 'Tunis': 270, 'Sousse': 130, 'Djerba': 230, 'Monastir': 150, 'Hammamet': 200, 'Nabeul': 200, 'Bizerte': 330 },
      'Djerba': { 'Tunis': 500, 'Sousse': 360, 'Sfax': 230, 'Monastir': 340, 'Hammamet': 435, 'Nabeul': 435, 'Bizerte': 560 }
    };

    const distance = cityDistances[origin]?.[destination] || 100;
    const kilometricRate = 0.5; // 0.5 TND par km

    return {
      distance,
      kilometricRate,
      pickupFee: distance * kilometricRate, // Station → Adresse
      dropoffFee: distance * kilometricRate, // Adresse → Station
      roundTripFee: distance * kilometricRate * 2 // Adresse → Adresse (aller-retour)
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Gérer mes tarifs de privatisation</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          <p className="text-white/80 text-sm">
            Configurez les tarifs pour vos services de privatisation de véhicule
          </p>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Tarifs de privatisation par route</h3>
              <div className="text-sm text-gray-600">
                Définissez vos prix de base - Les autres frais sont calculés automatiquement
              </div>
            </div>

            {/* Informations importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Informations importantes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Frais de service:</strong> Toujours 15% (non modifiable)</li>
                    <li>• <strong>Tarifs kilométriques:</strong> Calculés automatiquement selon la distance</li>
                    <li>• <strong>Frais de prise en charge:</strong> Station la plus proche → Adresse demandée</li>
                    <li>• <strong>Frais de dépose:</strong> Adresse demandée → Station la plus proche</li>
                    <li>• <strong>Taux kilométrique:</strong> 0.5 TND/km (aller-retour pour adresses précises)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ajouter une nouvelle route */}
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
              <h4 className="font-bold text-lg mb-4">Ajouter une nouvelle route</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700">Départ *</label>
                  <select
                    value={newRoutePrice.origin}
                    onChange={(e) => setNewRoutePrice({ ...newRoutePrice, origin: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Djerba', 'Hammamet', 'Nabeul', 'Bizerte', 'Kairouan', 'Gabès', 'Ariana', 'Ben Arous', 'Mannouba', 'Zaghouan', 'Siliana'].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Destination *</label>
                  <select
                    value={newRoutePrice.destination}
                    onChange={(e) => setNewRoutePrice({ ...newRoutePrice, destination: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Djerba', 'Hammamet', 'Nabeul', 'Bizerte', 'Kairouan', 'Gabès', 'Ariana', 'Ben Arous', 'Mannouba', 'Zaghouan', 'Siliana'].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Prix de base (TND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newRoutePrice.basePrice}
                    onChange={(e) => setNewRoutePrice({ ...newRoutePrice, basePrice: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Prix de base pour la route"
                  />
                </div>
              </div>

              {/* Affichage des calculs automatiques */}
              {newRoutePrice.origin && newRoutePrice.destination && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-bold text-green-900 mb-2">Calculs automatiques prévus</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance estimée:</span>
                      <span className="font-bold">{calculateKilometricFees(newRoutePrice.origin, newRoutePrice.destination).distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux kilométrique:</span>
                      <span className="font-bold">{calculateKilometricFees(newRoutePrice.origin, newRoutePrice.destination).kilometricRate} TND/km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais prise en charge:</span>
                      <span className="font-bold">{calculateKilometricFees(newRoutePrice.origin, newRoutePrice.destination).pickupFee} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais dépose:</span>
                      <span className="font-bold">{calculateKilometricFees(newRoutePrice.origin, newRoutePrice.destination).dropoffFee} TND</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddRoutePrice}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Ajouter la route
                </button>
              </div>
            </div>

            {/* Liste des routes configurées */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Routes configurées</h4>
              {routePrivatePrices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Aucune route configurée pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Route</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Prix de base</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Distance</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Frais km (aller-retour)</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Total estimé</th>
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routePrivatePrices.map((route) => {
                        const fees = calculateKilometricFees(route.origin, route.destination);
                        const estimatedTotal = route.basePrice + (route.basePrice * 0.15) + fees.roundTripFee; // Base + 15% + frais km aller-retour

                        return (
                          <tr key={route.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3">
                              <div className="font-medium">{route.origin}</div>
                              <div className="text-sm text-gray-500">→ {route.destination}</div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <span className="font-bold text-green-600">{formatCurrency(route.basePrice)}</span>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              {fees.distance} km
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="space-y-1">
                                <div>Prise: {formatCurrency(fees.pickupFee)}</div>
                                <div>Dépose: {formatCurrency(fees.dropoffFee)}</div>
                                <div className="font-bold">Total: {formatCurrency(fees.roundTripFee)}</div>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <span className="font-bold text-lg text-blue-600">{formatCurrency(estimatedTotal)}</span>
                              <div className="text-xs text-gray-500">avec 15% frais service</div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              <button
                                onClick={() => handleDeleteRoutePrice(route.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Résumé des règles de calcul */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-yellow-900 mb-3">Résumé des règles de calcul automatique</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-bold text-yellow-800 mb-2">Pour les adresses précises:</h5>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• Station → Adresse: Distance × 0.5 TND</li>
                    <li>• Adresse → Station: Distance × 0.5 TND</li>
                    <li>• Adresse → Adresse: Distance × 0.5 TND × 2 (aller-retour)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-yellow-800 mb-2">Exemples de calcul:</h5>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• Tunis → Sousse: 140 km × 0.5 = 70 TND</li>
                    <li>• Sousse → Sfax: 130 km × 0.5 = 65 TND</li>
                    <li>• Tunis → Djerba: 500 km × 0.5 = 250 TND</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {routePrivatePrices.length} route{routePrivatePrices.length > 1 ? 's' : ''} configurée{routePrivatePrices.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAll}
                className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Enregistrer tous les tarifs
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingManager;
