import React, { useState } from 'react';
import { X, AlertTriangle, Users, MapPin, Clock, Calendar, MessageSquare, XCircle } from 'lucide-react';
import { Trip, BookingRequest } from '../types';
import { notificationService } from '../services/notificationService';

interface TripCancellationProps {
  trip: Trip;
  bookings: BookingRequest[];
  onCancel: (tripId: string, reason: string) => void;
  onClose: () => void;
}

const TripCancellation: React.FC<TripCancellationProps> = ({ trip, bookings, onCancel, onClose }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedReasons = [
    'Problème mécanique du véhicule',
    'Urgence familiale',
    'Mauvaises conditions météo',
    'Problème de santé',
    'Panne de carburant',
    'Accident de la route',
    'Autre raison personnelle'
  ];

  const passengers = bookings.filter(b => b.status === 'accepted');
  const totalPassengers = passengers.reduce((sum, p) => sum + p.passengerCount, 0);

  const handleSubmit = async () => {
    if (!selectedReason && !customReason.trim()) {
      alert('Veuillez sélectionner un motif ou renseigner un motif personnalisé');
      return;
    }

    const finalReason = selectedReason || customReason.trim();
    
    setIsSubmitting(true);
    
    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Notifier tous les passagers
    passengers.forEach(passenger => {
      notificationService.notifyBookingDeclined(
        passenger.passengerName,
        'Chauffeur Firqa',
        `${trip.origin} → ${trip.destination}`
      );
      
      // Notification d'annulation spécifique
      notificationService.addNotification({
        userId: 'p1', // Simplifié pour la démo
        type: 'booking_declined',
        title: 'Trajet annulé',
        message: `Votre trajet ${trip.origin} → ${trip.destination} a été annulé. Motif: ${finalReason}`,
        read: false
      });
    });
    
    onCancel(trip.id, finalReason);
    setIsSubmitting(false);
  };

  const getReasonDisplay = () => {
    if (selectedReason) return selectedReason;
    if (customReason.trim()) return customReason.trim();
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-black">Annulation de trajet</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm">
              L'annulation d'un trajet affecte {passengers.length} passager(s) ayant réservé.
              Un motif obligatoire sera communiqué aux passagers concernés.
            </p>
          </div>
        </div>

        {/* Informations du trajet */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg mb-4">Détails du trajet concerné</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-green-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Départ</div>
                  <div className="font-bold">{trip.origin}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-red-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Arrivée</div>
                  <div className="font-bold">{trip.destination}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Heure</div>
                  <div className="font-bold">{trip.departureTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-purple-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Passagers</div>
                  <div className="font-bold">{totalPassengers} personne(s)</div>
                </div>
              </div>
            </div>
            
            {/* Liste des passagers concernés */}
            {passengers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-bold text-gray-700 mb-2">Passagers concernés :</div>
                <div className="space-y-2">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {passenger.passengerName.charAt(0)}
                        </div>
                        <span className="font-medium">{passenger.passengerName}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {passenger.passengerCount} place{passenger.passengerCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motif d'annulation */}
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4">Motif d'annulation <span className="text-red-600">*</span></h3>
          
          {/* Raisons prédéfinies */}
          <div className="space-y-3 mb-4">
            {predefinedReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedReason === reason
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="cancellationReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    setCustomReason('');
                  }}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <span className="font-medium">{reason}</span>
              </label>
            ))}
          </div>

          {/* Motif personnalisé */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Autre motif (précisez)
            </label>
            <textarea
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setSelectedReason('');
              }}
              placeholder="Décrivez en détail la raison de l'annulation..."
              rows={4}
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Aperçu du motif */}
          {getReasonDisplay() && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <MessageSquare size={20} />
                <span className="font-bold">Motif qui sera envoyé aux passagers :</span>
              </div>
              <p className="text-yellow-700 italic">"{getReasonDisplay()}"</p>
            </div>
          )}

          {/* Avertissement */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={20} />
              <span className="font-bold">Important :</span>
            </div>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>• Cette action est irréversible</li>
              <li>• Tous les passagers seront notifiés immédiatement</li>
              <li>• Des annulations fréquentes peuvent affecter votre note</li>
              <li>• Un motif valide est obligatoire pour la modération</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!selectedReason && !customReason.trim())}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <XCircle size={20} className="inline mr-2" />
                  Confirmer l'annulation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCancellation;
