import React, { useState } from 'react';
import { X, AlertTriangle, Users, MapPin, Clock, Calendar, MessageSquare, XCircle, Briefcase } from 'lucide-react';
import { BookingRequest } from '../types';
import { notificationService } from '../services/notificationService';

interface BookingCancellationProps {
  booking: BookingRequest;
  tripOrigin: string;
  tripDestination: string;
  onCancel: (bookingId: string, reason: string) => void;
  onClose: () => void;
}

const BookingCancellation: React.FC<BookingCancellationProps> = ({ 
  booking, 
  tripOrigin, 
  tripDestination, 
  onCancel, 
  onClose 
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedReasons = [
    'Passager absent au point de rendez-vous',
    'Comportement inapproprié du passager',
    'Demande de dernière minute non conforme',
    'Problème de communication avec le passager',
    'Passager en retard (>15 minutes)',
    'Bagages excessifs ou non conformes',
    'Autre raison spécifique'
  ];

  const handleSubmit = async () => {
    const finalReason = selectedReason || customReason.trim();
    
    if (!finalReason) {
      alert('Veuillez sélectionner un motif ou renseigner un motif personnalisé');
      return;
    }

    setIsSubmitting(true);
    
    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Notifier le passager de l'annulation
    notificationService.addNotification({
      userId: 'p1', // Simplifié pour la démo
      type: 'booking_declined',
      title: 'Réservation annulée par le chauffeur',
      message: `Votre réservation ${tripOrigin} → ${tripDestination} a été annulée. Motif: ${finalReason}`,
      read: false
    });
    
    onCancel(booking.id, finalReason);
    setIsSubmitting(false);
  };

  const getReasonDisplay = () => {
    if (selectedReason) return selectedReason;
    if (customReason.trim()) return customReason.trim();
    return '';
  };

  const formatLuggageDetails = (luggageDetails?: any) => {
    if (!luggageDetails) return '0 bagage';
    
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-black">Annulation de réservation</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm">
              Vous êtes sur le point d'annuler la réservation de ce passager.
              Un motif obligatoire sera communiqué au passager concerné.
            </p>
          </div>
        </div>

        {/* Informations de la réservation */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg mb-4">Détails de la réservation</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Passager</div>
                  <div className="font-bold">{booking.passengerName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-green-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Nombre de passagers</div>
                  <div className="font-bold">{booking.passengerCount} personne(s)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-green-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Trajet</div>
                  <div className="font-bold">{tripOrigin} → {tripDestination}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Heure de réservation</div>
                  <div className="font-bold">{booking.timestamp}</div>
                </div>
              </div>
            </div>
            
            {/* Détails des bagages */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Briefcase size={16} />
                Bagages réservés :
              </div>
              <div className="text-gray-600">
                {formatLuggageDetails(booking.luggageDetails)}
              </div>
            </div>
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
              Autre motif (précisez) <span className="text-red-600">*</span>
            </label>
            <textarea
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setSelectedReason('');
              }}
              placeholder="Décrivez en détail la raison de l'annulation de cette réservation..."
              rows={4}
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Aperçu du motif */}
          {getReasonDisplay() && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <MessageSquare size={20} />
                <span className="font-bold">Motif qui sera envoyé au passager :</span>
              </div>
              <p className="text-yellow-700 italic">"{getReasonDisplay()}"</p>
            </div>
          )}

          {/* Avertissements */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={20} />
              <span className="font-bold">Important :</span>
            </div>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>• Cette action est irréversible</li>
              <li>• Le passager sera notifié immédiatement</li>
              <li>• Des annulations fréquentes peuvent affecter votre note</li>
              <li>• Un motif valide est obligatoire pour la modération</li>
              <li>• Les places seront libérées automatiquement</li>
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

export default BookingCancellation;
