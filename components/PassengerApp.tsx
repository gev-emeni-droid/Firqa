import React, { useMemo, useState } from 'react';
import { Search, MapPin, Calendar, Users, ChevronRight, Star, Clock, Shield, CheckCircle2, Briefcase, X, AlertCircle, Navigation, Car, Settings, Bell, Heart, Building2, Home } from 'lucide-react';
import { ROUTES } from '../constants';
import { Trip, BookingRequest } from '../types';
import OnDemandRequest from './OnDemandRequest';
import DriverProfile from './DriverProfile';
import FavoriteDrivers from './FavoriteDrivers';
import DirectPrivateHire from './DirectPrivateHire';
import DriverResponsesModal from './DriverResponsesModal';
import { profileService } from '../services/profileService';

interface PassengerAppProps {
  trips: Trip[];
  onRequestBooking: (req: BookingRequest) => void;
  userRequests: BookingRequest[];
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

const PassengerApp: React.FC<PassengerAppProps> = ({ trips, onRequestBooking, userRequests }) => {
  const LUGGAGE_FEES: Record<keyof typeof luggageDetails, number> = {
    sac: 2,
    petiteValise: 5,
    moyenneValise: 8,
    grandeValise: 12
  };
  const SERVICE_FEE = 1.5;
  const VAT_RATE = 0.19;
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [luggageDetails, setLuggageDetails] = useState({
    sac: 0,
    petiteValise: 0,
    moyenneValise: 0,
    grandeValise: 0
  });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOnDemandModal, setShowOnDemandModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFavoriteDrivers, setShowFavoriteDrivers] = useState(false);
  const [selectedDriverProfile, setSelectedDriverProfile] = useState<any>(null);
  const [showDirectPrivateHire, setShowDirectPrivateHire] = useState(false);
  const [selectedDriverForHire, setSelectedDriverForHire] = useState<any>(null);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [message, setMessage] = useState('');
  const [requestType, setRequestType] = useState<'on_demand' | 'private_hire'>('on_demand');
  const [driverResponses, setDriverResponses] = useState<DriverResponse[]>([]);
  const [showDriverResponsesModal, setShowDriverResponsesModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    fullName: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+216 22 123 456'
  });
  const [selectedDriverForPayment, setSelectedDriverForPayment] = useState<DriverResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'apple_pay' | 'google_pay'>('card');
  const [paymentCards, setPaymentCards] = useState([
    { id: 'card1', brand: 'Visa', last4: '4242', expiry: '02/27', isDefault: true },
    { id: 'card2', brand: 'Mastercard', last4: '9931', expiry: '11/26', isDefault: false }
  ]);
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvc: '' });
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [referralData, setReferralData] = useState({
    link: 'https://firqa.app/invite/JEAN123',
    invites: [
      { id: 'inv1', name: 'Sarra Jlassi', tripsCompleted: 2 },
      { id: 'inv2', name: 'Youssef B.', tripsCompleted: 1 },
      { id: 'inv3', name: 'Amira L.', tripsCompleted: 0 }
    ]
  });
  const [hasCopiedReferral, setHasCopiedReferral] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'contact' | 'payment' | 'referral'>('contact');
  const [noShowReport, setNoShowReport] = useState<{ driverName: string; requestType: 'on_demand' | 'private_hire'; context: 'on_demand'; timestamp: string } | null>(null);
  const [noShowReason, setNoShowReason] = useState('');
  const [bookingStep, setBookingStep] = useState<'details' | 'payment'>('details');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const priceDetails = useMemo(() => {
    if (!selectedTrip) {
      return { base: 0, luggage: 0, service: 0, vat: 0, total: 0 };
    }
    const base = passengerCount * (selectedTrip.priceCollective || 0);
    const luggage = (luggageDetails.sac * LUGGAGE_FEES.sac) +
      (luggageDetails.petiteValise * LUGGAGE_FEES.petiteValise) +
      (luggageDetails.moyenneValise * LUGGAGE_FEES.moyenneValise) +
      (luggageDetails.grandeValise * LUGGAGE_FEES.grandeValise);
    const service = SERVICE_FEE;
    const vat = service * VAT_RATE;
    const total = base + luggage + service + vat;
    return { base, luggage, service, vat, total };
  }, [selectedTrip, passengerCount, luggageDetails]);

  // Récupérer la capacité de bagages du chauffeur
  const driverProfile = profileService.getProfile('d1');
  const driverLuggageCapacity = driverProfile?.luggageCapacity || {
    sac: 5,
    petiteValise: 3,
    moyenneValise: 2,
    grandeValise: 1
  };

  const handleSearch = () => {
    setLoadingSearch(true);
    setTimeout(() => setLoadingSearch(false), 800);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simuler la conversion en adresse (dans une vraie app, utiliser une API de géocodage)
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setSearchOrigin(`Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setCurrentLocation('Impossible d\'obtenir la position');
        }
      );
    } else {
      setCurrentLocation('La géolocalisation n\'est pas supportée');
    }
  };

  const handleInitiateBooking = (trip: Trip) => {
    setSelectedTrip(trip);
    // Réinitialiser les valeurs pour le nouveau trajet
    setPassengerCount(Math.min(1, trip.availableSeats));
    setLuggageDetails({
      sac: 0,
      petiteValise: 0,
      moyenneValise: 0,
      grandeValise: 0
    });
    setMessage('');
    setShowConfirmModal(true);
    setBookingStep('details');
    setPaymentMethod('card');
  };

  const handleSubmitRequest = () => {
    if (!selectedTrip) return;

    // Calculer le nombre total de bagages
    const totalLuggage = luggageDetails.sac + luggageDetails.petiteValise + luggageDetails.moyenneValise + luggageDetails.grandeValise;

    const newRequest: BookingRequest = {
      id: `req${Date.now()}`,
      tripId: selectedTrip.id,
      passengerName: 'Moi',
      passengerCount,
      luggageCount: totalLuggage,
      luggageDetails, // Ajouter les détails des bagages
      status: 'pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      route: `${selectedTrip.origin} ➔ ${selectedTrip.destination}`
    };

    onRequestBooking(newRequest);
    setShowConfirmModal(false);
    setSelectedTrip(null);
    setBookingStep('details');
  };

  const handleOnDemandSubmit = (request: any) => {
    console.log('On-demand request submitted:', request);
    setShowOnDemandModal(false);

    // Simuler les réponses des chauffeurs après un court délai
    setTimeout(() => {
      const mockResponses: DriverResponse[] = [
        {
          driverId: 'd1',
          driverName: 'Mondher Ben Ali',
          status: 'accepted',
          price: 15,
          estimatedArrival: '8 min',
          message: 'Je suis disponible pour cette course',
          timestamp: new Date().toISOString()
        },
        {
          driverId: 'd2',
          driverName: 'Ali Jlassi',
          status: 'accepted',
          price: 12,
          estimatedArrival: '12 min',
          message: 'Je peux vous prendre',
          timestamp: new Date().toISOString()
        },
        {
          driverId: 'd3',
          driverName: 'Sami Trabelsi',
          status: 'declined',
          message: 'Non disponible actuellement',
          timestamp: new Date().toISOString()
        }
      ];

      setDriverResponses(mockResponses);
      setShowDriverResponsesModal(true);
    }, 3000);
  };

  const handleAcceptDriver = (driverResponse: DriverResponse) => {
    setSelectedDriverForPayment(driverResponse);
  };

  const confirmPrivatizationPayment = () => {
    if (!selectedDriverForPayment) return;

    if (paymentMethod === 'card') {
      alert("Redirection vers la plateforme de paiement sécurisée...");
    } else {
      alert("Demande de privatisation confirmée. Rappel : Pour les privatisations réglées en espèces, le paiement total doit être effectué auprès du chauffeur au moment de la prise en charge.");
    }

    console.log('Driver officially accepted with payment:', selectedDriverForPayment);

    // Retirer le chauffeur de la liste
    setDriverResponses(prev => prev.filter(r => r.driverId !== selectedDriverForPayment.driverId));

    // Fermer le modal si plus de chauffeurs
    if (driverResponses.length <= 1) {
      setShowDriverResponsesModal(false);
    }

    setSelectedDriverForPayment(null);
  };

  const updateLuggage = (type: keyof typeof luggageDetails, delta: number) => {
    const currentValue = luggageDetails[type];
    const maxValue = driverLuggageCapacity[type];
    const newValue = Math.max(0, Math.min(maxValue, currentValue + delta));

    if (newValue !== currentValue) {
      setLuggageDetails(prev => ({
        ...prev,
        [type]: newValue
      }));
    }
  };

  const getTotalLuggage = () => {
    return luggageDetails.sac + luggageDetails.petiteValise + luggageDetails.moyenneValise + luggageDetails.grandeValise;
  };

  const handleContactChange = (field: keyof typeof contactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.holder || !newCard.expiry || !newCard.cvc) return;
    const last4 = newCard.number.slice(-4);
    const brand = newCard.number.startsWith('5') ? 'Mastercard' : newCard.number.startsWith('4') ? 'Visa' : 'Carte';

    setPaymentCards(prev => [
      ...prev,
      {
        id: `card-${Date.now()}`,
        brand,
        last4,
        expiry: newCard.expiry,
        isDefault: prev.length === 0
      }
    ]);

    setNewCard({ number: '', holder: '', expiry: '', cvc: '' });
    setShowNewCardForm(false);
  };

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentCards(prev =>
      prev.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const handleRemoveCard = (cardId: string) => {
    setPaymentCards(prev => {
      const filtered = prev.filter(card => card.id !== cardId);
      if (filtered.length > 0 && !filtered.some(card => card.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData.link);
      setHasCopiedReferral(true);
      setTimeout(() => setHasCopiedReferral(false), 2500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  const openNoShowReport = (driverName: string) => {
    setNoShowReport({
      driverName,
      requestType,
      context: 'on_demand',
      timestamp: new Date().toISOString()
    });
    setNoShowReason('');
  };

  const handleSubmitNoShowReport = () => {
    if (!noShowReport) return;
    console.log('No-show report:', {
      ...noShowReport,
      reason: noShowReason
    });
    alert(`Le no-show du chauffeur ${noShowReport.driverName} a été signalé. Merci pour votre retour.`);
    setNoShowReport(null);
    setNoShowReason('');
  };

  const getTotalCapacity = () => {
    return driverLuggageCapacity.sac + driverLuggageCapacity.petiteValise + driverLuggageCapacity.moyenneValise + driverLuggageCapacity.grandeValise;
  };

  const isLuggageCapacityReached = (type: keyof typeof luggageDetails) => {
    return luggageDetails[type] >= driverLuggageCapacity[type];
  };

  const isTotalLuggageCapacityReached = () => {
    return getTotalLuggage() >= getTotalCapacity();
  };

  const handleDriverProfileClick = (driver: any) => {
    // Ouvrir le profil du chauffeur dans une nouvelle page
    const driverId = driver.id || driver.driverId || 'unknown';
    window.open(`/driver-profile/${driverId}`, '_blank');
  };

  const paymentOptions = [
    {
      id: 'card',
      label: 'Carte bancaire',
      description: 'Visa, Mastercard, AmEx',
      renderIcon: (isActive: boolean) => (
        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
          <Shield size={18} />
        </div>
      )
    },
    {
      id: 'apple_pay',
      label: 'Apple Pay',
      description: 'Paiement via Wallet',
      renderIcon: (isActive: boolean) => (
        <div className={`px-3 py-1 rounded-lg text-xs font-black ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}> Pay</div>
      )
    },
    {
      id: 'google_pay',
      label: 'Google Pay',
      description: 'Paiement via GPay',
      renderIcon: (isActive: boolean) => (
        <div className={`px-3 py-1 rounded-lg text-xs font-black ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>G Pay</div>
      )
    },
    {
      id: 'cash',
      label: 'Espèces',
      description: 'À remettre au chauffeur',
      renderIcon: (isActive: boolean) => (
        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
          <Users size={18} />
        </div>
      )
    }
  ] as const;

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setBookingStep('details');
    setPaymentMethod('card');
    setSelectedCardId(null);
  };

  const ensureSelectedCard = () => {
    const defaultCard = paymentCards.find(card => card.isDefault) ?? paymentCards[0];
    setSelectedCardId(defaultCard ? defaultCard.id : null);
  };

  const handlePrimaryAction = () => {
    if (bookingStep === 'details') {
      ensureSelectedCard();
      setBookingStep('payment');
      return;
    }
    if (paymentMethod === 'card' && !selectedCardId) {
      alert("Veuillez choisir une carte de paiement avant de continuer.");
      return;
    }
    handleSubmitRequest();
  };

  const isPrimaryDisabled =
    bookingStep === 'details'
      ? isTotalLuggageCapacityReached()
      : paymentMethod === 'card' && !selectedCardId;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="text-center space-y-10 pt-6">
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-[#2F2E2E]">Où allons-nous ?</h2>
        <p className="text-[#7D4F50] font-medium text-lg">Réservez votre confort, gérez vos bagages, voyagez serein.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            setRequestType('on_demand');
            setShowOnDemandModal(true);
          }}
          className="flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all group/btn"
        >
          <Navigation size={32} className="group-hover/btn:scale-110 transition-transform" />
          <span className="text-xl font-black">Louage à proximité</span>
        </button>
        <button
          onClick={() => {
            setRequestType('private_hire');
            setShowOnDemandModal(true);
          }}
          className="flex items-center justify-center gap-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all group/btn"
        >
          <Users size={32} className="group-hover/btn:scale-110 transition-transform" />
          <span className="text-xl font-black">Privatisation</span>
        </button>
        <button
          onClick={() => setShowFavoriteDrivers(true)}
          className="flex items-center justify-center gap-4 bg-gradient-to-r from-red-500 to-pink-500 text-white p-8 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all group/btn"
        >
          <Heart size={32} className="group-hover/btn:scale-110 transition-transform" />
          <span className="text-xl font-black">Mes Favoris</span>
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center justify-center gap-4 bg-gradient-to-r from-[#D5BDAF] to-[#B08968] text-white p-8 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all group/btn"
        >
          <Settings size={32} className="group-hover/btn:scale-110 transition-transform" />
          <span className="text-xl font-black">Paramètres</span>
        </button>
      </div>

      {/* Search Widget */}
      <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-[#D5BDAF]/10 -mt-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D5BDAF] to-[#B08968] rounded-bl-2xl flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl font-black">🚗</div>
            <div className="text-sm font-bold">Louage<br />Immédiat</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#D5BDAF] group-focus-within:text-[#B08968] transition-colors" size={20} />
              <div className="relative">
                <input
                  type="text"
                  value={searchOrigin}
                  onChange={(e) => {
                    setSearchOrigin(e.target.value);
                    setUseCurrentLocation(false);
                  }}
                  placeholder="Ville de départ"
                  className="w-full p-6 pl-16 pr-12 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-[2rem] focus:ring-4 focus:ring-[#D5BDAF]/10 outline-none font-black text-xl transition-all"
                />
                <button
                  onClick={getCurrentLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#D5BDAF]/20 hover:bg-[#D5BDAF]/40 rounded-full transition-colors"
                  title="Utiliser ma position actuelle"
                >
                  <Navigation size={16} className="text-[#B08968]" />
                </button>
              </div>
              {useCurrentLocation && currentLocation && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                  📍 {currentLocation}
                </div>
              )}

              {/* No-Show Report Modal */}
              {noShowReport && (
                <div className="fixed inset-0 z-[320] bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black text-[#2F2E2E]">Signaler un no-show</h3>
                        <p className="text-sm text-gray-500">
                          Chauffeur : <span className="font-bold text-[#7D4F50]">{noShowReport.driverName}</span>
                        </p>
                        <p className="text-xs text-gray-400">Type de demande : {noShowReport.requestType === 'on_demand' ? 'Louage en chemin' : 'Privatisation'}.</p>
                      </div>
                      <button onClick={() => setNoShowReport(null)} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Décrivez la situation *</label>
                      <textarea
                        value={noShowReason}
                        onChange={(e) => setNoShowReason(e.target.value)}
                        rows={4}
                        placeholder="Ex: Le chauffeur n’est pas venu au point de rendez-vous après 15 minutes d’attente..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#B08968] focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={handleSubmitNoShowReport}
                        disabled={!noShowReason.trim()}
                        className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl font-bold ${noShowReason.trim()
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        Envoyer le signalement
                      </button>
                      <button
                        onClick={() => setNoShowReport(null)}
                        className="flex-1 min-w-[150px] px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative group">
              <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#D5BDAF] group-focus-within:text-[#B08968] transition-colors" size={20} />
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="Destination"
                className="w-full p-6 pl-16 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-[2rem] focus:ring-4 focus:ring-[#D5BDAF]/10 outline-none font-black text-xl transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loadingSearch || !searchOrigin || !searchDestination}
            className="w-full bg-[#2F2E2E] text-white p-7 rounded-[2rem] font-black text-2xl hover:bg-[#D5BDAF] shadow-2xl transition-all flex items-center justify-center gap-4 group/btn disabled:opacity-50"
          >
            {loadingSearch ? <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : <><Search size={32} /> Rechercher mon trajet</>}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-3xl font-black text-[#2F2E2E]">Offres Disponibles</h3>
          <div className="bg-[#FAF7F2] px-5 py-2 rounded-full border border-[#D5BDAF]/20 text-xs font-black text-[#7D4F50] uppercase tracking-widest cursor-pointer hover:bg-[#D5BDAF] transition-all">Filtrer les prix</div>
        </div>

        {/* Information sur la capacité de bagages */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-blue-600" />
            <span className="font-medium text-blue-900">Capacité de bagages du chauffeur: {getTotalCapacity()} articles</span>
          </div>
          <div className="text-sm text-blue-700">
            • Sac: {driverLuggageCapacity.sac} | • Petite valise: {driverLuggageCapacity.petiteValise} | • Moyenne valise: {driverLuggageCapacity.moyenneValise} | • Grande valise: {driverLuggageCapacity.grandeValise}
          </div>
        </div>

        <div className="grid gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-[#D5BDAF]/10 hover:shadow-2xl hover:border-[#D5BDAF]/30 transition-all group">
              <div className="flex items-center gap-8 w-full lg:w-auto justify-between border-t lg:border-t-0 pt-8 lg:pt-0">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-[#F5EBE0] rounded-[2.5rem] overflow-hidden border-8 border-[#D5BDAF]/20 shadow-xl group-hover:scale-105 transition-transform cursor-pointer" onClick={() => handleDriverProfileClick(trip)}>
                    <img src={`https://picsum.photos/seed/${trip.id}/300/300`} alt="driver" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4
                        className="font-black text-2xl text-[#2F2E2E] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleDriverProfileClick(trip)}
                      >
                        Chauffeur #{trip.id.slice(1, 4)}
                      </h4>
                      <span className="bg-[#FAF7F2] text-[#B08968] text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 border border-[#D5BDAF]/20">
                        <Star size={12} fill="currentColor" /> 4.9
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7D4F50] font-bold text-sm">
                      <Clock size={16} className="text-[#B08968]" /> Départ {trip.departureTime || 'ASAP'}
                    </div>
                    <div className="flex items-center gap-2 text-[#7D4F50] font-bold text-sm">
                      <MapPin size={16} className="text-[#B08968]" /> {trip.origin} ➔ {trip.destination}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right space-y-1">
                    <div className="text-3xl font-black text-[#2F2E2E]">{trip.priceCollective} TND</div>
                    <div className="text-sm text-[#7D4F50]">Collectif</div>
                    <div className="text-2xl font-black text-[#2F2E2E]">{trip.pricePrivate} TND</div>
                    <div className="text-sm text-[#7D4F50]">Privé</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#B08968]" />
                    <span className="text-sm font-bold text-[#7D4F50]">{trip.availableSeats}/{trip.totalSeats} places</span>
                  </div>
                  <button
                    onClick={() => handleInitiateBooking(trip)}
                    className="bg-[#2F2E2E] text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-[#D5BDAF] transition-all shadow-lg flex items-center gap-3 group/btn"
                  >
                    <ChevronRight size={20} className="group-hover/btn:translate-x-1" />
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* On-Demand Request Modal */}
      {showOnDemandModal && (
        <OnDemandRequest
          onClose={() => setShowOnDemandModal(false)}
          onSubmit={handleOnDemandSubmit}
          requestType={requestType}
        />
      )}

      {/* Driver Responses Modal */}
      {showDriverResponsesModal && (
        <DriverResponsesModal
          isOpen={showDriverResponsesModal}
          onClose={() => setShowDriverResponsesModal(false)}
          responses={driverResponses}
          onAcceptDriver={handleAcceptDriver}
          onReportNoShow={(driver) => openNoShowReport(driver.driverName)}
          requestDetails={{
            origin: searchOrigin || 'Tunis',
            destination: searchDestination || 'Sousse',
            pickupDate: new Date().toISOString().split('T')[0],
            pickupTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            passengerCount: passengerCount,
            luggageCount: getTotalLuggage()
          }}
        />
      )}

      {/* Favorite Drivers Modal */}
      {showFavoriteDrivers && (
        <FavoriteDrivers
          onClose={() => setShowFavoriteDrivers(false)}
        />
      )}

      {/* Driver Profile Modal - Supprimé car maintenant ouvre dans une nouvelle page */}
      {selectedDriverProfile && (
        <DriverProfile
          driver={selectedDriverProfile}
          onClose={() => setSelectedDriverProfile(null)}
          onToggleFavorite={(driverId) => {
            // Logique pour ajouter/retirer des favoris
            console.log('Toggle favorite for driver:', driverId);
          }}
          isFavorite={false}
          onRequestPrivateHire={(driver) => {
            setSelectedDriverForHire(driver);
            setShowDirectPrivateHire(true);
            setSelectedDriverProfile(null);
          }}
        />
      )}

      {/* Modal de paiement pour privatisation */}
      {selectedDriverForPayment && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary text-white p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black">Paiement Privatisation</h3>
                <button onClick={() => setSelectedDriverForPayment(null)} className="p-2 hover:bg-white/20 rounded-xl">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <div className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">Chauffeur choisi</div>
                <div className="text-lg font-black">{selectedDriverForPayment.driverName}</div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h4 className="font-black text-lg mb-4 text-gray-900">Mode de règlement</h4>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Shield size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">Carte Bancaire</div>
                        <div className="text-xs opacity-70">Paiement sécurisé</div>
                      </div>
                    </div>
                    {paymentMethod === 'card' && <CheckCircle2 size={20} className="text-blue-600" />}
                  </button>
                </div>
              </div>

              {/* Détail du prix Privatisation */}
              <div className="bg-[#2F2E2E] text-white p-6 rounded-[2rem] space-y-3">
                <div className="flex justify-between items-center text-sm opacity-80">
                  <span>Offre du chauffeur</span>
                  <span>{selectedDriverForPayment.price.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-80">
                  <span>Frais de service (Firqa)</span>
                  <span>{(2.500).toFixed(3)} TND</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="font-black text-lg">Total à régler</span>
                  <span className="text-2xl font-black text-accent">{(selectedDriverForPayment.price + 2.500).toFixed(3)} TND</span>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0" size={18} />
                  <p className="text-sm text-orange-900">
                    <span className="font-bold">Rappel :</span> Le paiement doit être effectué au chauffeur <span className="font-black">avant de monter</span> dans le véhicule.
                  </p>
                </div>
              )}

              <button
                onClick={confirmPrivatizationPayment}
                className="w-full bg-[#2F2E2E] text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl transition-all shadow-lg"
              >
                {paymentMethod === 'card' ? 'Procéder au paiement' : 'Confirmer l\'acceptation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Private Hire Modal */}
      {
        showDirectPrivateHire && selectedDriverForHire && (
          <DirectPrivateHire
            driver={selectedDriverForHire}
            onClose={() => {
              setShowDirectPrivateHire(false);
              setSelectedDriverForHire(null);
            }}
            onSubmit={(request) => {
              console.log('Direct private hire request:', request);
              // Logique pour traiter la demande de privatisation directe
            }}
          />
        )
      }

      {/* Settings Modal */}
      {
        showSettingsModal && (
          <div className="fixed inset-0 z-[300] bg-[#2F2E2E]/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#FAF7F2] w-full max-w-2xl max-h-[85vh] rounded-[2rem] p-8 space-y-6 relative animate-in zoom-in slide-in-from-bottom-5 duration-300 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-y-auto">
              <button onClick={() => setShowSettingsModal(false)} className="absolute top-6 right-6 p-3 hover:bg-[#D5BDAF]/10 rounded-full transition-all text-[#7D4F50]">
                <X size={24} />
              </button>

              <div className="space-y-8">
                <h2 className="text-4xl font-black leading-tight text-[#2F2E2E]">Paramètres du compte</h2>

                {/* Tabs */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'contact', label: 'Contact & Profil' },
                    { id: 'payment', label: 'Paiements' },
                    { id: 'referral', label: 'Parrainage' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id as typeof activeSettingsTab)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeSettingsTab === tab.id
                        ? 'bg-[#2F2E2E] text-white border-[#2F2E2E]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#B08968]'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Contact Information */}
                {activeSettingsTab === 'contact' && (
                  <div className="bg-white rounded-2xl border border-[#D5BDAF]/40 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-[#2F2E2E]">Coordonnées</h3>
                        <p className="text-sm text-gray-500">Modifiez vos informations de contact</p>
                      </div>
                      <div className="text-xs font-bold bg-[#FAF7F2] text-[#B08968] px-4 py-1.5 rounded-full border border-[#D5BDAF]/40">
                        Passager
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nom complet</label>
                        <input
                          type="text"
                          value={contactInfo.fullName}
                          readOnly
                          className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-[#B08968]">
                          * Nom verrouillé : il doit correspondre à votre carte d’identité pour vérification par les chauffeurs.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => handleContactChange('phone', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email</label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <button className="flex-1 min-w-[150px] bg-[#2F2E2E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B08968] transition-all">
                        Sauvegarder les coordonnées
                      </button>
                      <button
                        onClick={() => setShowSettingsModal(false)}
                        className="flex-1 min-w-[150px] bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment cards */}
                {activeSettingsTab === 'payment' && (
                  <div className="bg-white rounded-2xl border border-[#D5BDAF]/40 p-5 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-black text-[#2F2E2E]">Moyens de paiement</h3>
                        <p className="text-sm text-gray-500">Configurez vos cartes bancaires pour régler vos voyages</p>
                      </div>
                      <button
                        onClick={() => setShowNewCardForm(prev => !prev)}
                        className="px-4 py-2 bg-[#2F2E2E] text-white rounded-xl font-bold hover:bg-[#B08968] transition-all"
                      >
                        {showNewCardForm ? 'Annuler' : 'Ajouter une carte'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {paymentCards.map(card => (
                        <div key={card.id} className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#D5BDAF]/40 flex-wrap gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-[#2F2E2E] font-black text-lg">
                              {card.brand} •••• {card.last4}
                              {card.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-300">Par défaut</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">Expiration {card.expiry}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {!card.isDefault && (
                              <button
                                onClick={() => handleSetDefaultCard(card.id)}
                                className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#D5BDAF] text-[#B08968] hover:bg-[#FAF7F2]"
                              >
                                Définir par défaut
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveCard(card.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}

                      {paymentCards.length === 0 && (
                        <div className="p-4 bg-[#FFF6E5] border border-[#FFD9A5] rounded-2xl text-sm text-[#7D4F50]">
                          Aucune carte enregistrée pour le moment.
                        </div>
                      )}
                    </div>

                    {showNewCardForm && (
                      <div className="space-y-4 border-t border-[#D5BDAF]/30 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Numéro de carte</label>
                            <input
                              type="text"
                              value={newCard.number}
                              onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                              placeholder="4242 4242 4242 4242"
                              className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Titulaire</label>
                            <input
                              type="text"
                              value={newCard.holder}
                              onChange={(e) => setNewCard(prev => ({ ...prev, holder: e.target.value }))}
                              placeholder="Jean Dupont"
                              className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Expiration</label>
                            <input
                              type="text"
                              value={newCard.expiry}
                              onChange={(e) => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                              placeholder="MM/AA"
                              className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">CVC</label>
                            <input
                              type="text"
                              value={newCard.cvc}
                              onChange={(e) => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                              placeholder="123"
                              className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleAddCard}
                          className="w-full bg-[#2F2E2E] text-white py-3 rounded-xl font-bold hover:bg-[#B08968] transition-all"
                        >
                          Ajouter la carte
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Referral section */}
                {activeSettingsTab === 'referral' && (
                  <div className="bg-white rounded-2xl border border-[#D5BDAF]/40 p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-black text-[#2F2E2E]">Parrainage</h3>
                        <p className="text-sm text-gray-500">
                          Partagez votre lien : si votre ami réalise 2 courses, votre prochaine course est offerte.
                        </p>
                      </div>
                      <div className="px-4 py-2 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-300">
                        2 courses = 1 course offerte
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Votre lien de parrainage</label>
                      <div className="flex gap-3 flex-wrap">
                        <input
                          type="text"
                          value={referralData.link}
                          readOnly
                          className="flex-1 min-w-[200px] p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                        />
                        <button
                          onClick={handleCopyReferralLink}
                          className="px-4 py-3 bg-[#2F2E2E] text-white rounded-xl font-bold hover:bg-[#B08968] transition-all"
                        >
                          {hasCopiedReferral ? 'Lien copié !' : 'Copier'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mes filleuls</h4>
                      {referralData.invites.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                          Vous n’avez pas encore invité d’amis.
                        </div>
                      ) : (
                        referralData.invites.map(invite => (
                          <div key={invite.id} className="flex items-center justify-between bg-[#FAF7F2] border border-[#D5BDAF]/30 rounded-xl p-3">
                            <div>
                              <div className="font-bold text-[#2F2E2E]">{invite.name}</div>
                              <div className="text-xs text-gray-500">Courses effectuées : {invite.tripsCompleted}/2</div>
                            </div>
                            <div className={`text-xs font-bold px-3 py-1 rounded-full ${invite.tripsCompleted >= 2 ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                              {invite.tripsCompleted >= 2 ? 'Récompense débloquée' : 'En attente'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {showConfirmModal && selectedTrip && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">Confirmer votre réservation</h2>
                <button onClick={handleCloseConfirmModal} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-lg">Détails du trajet</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chauffeur:</span>
                    <span className="font-medium">Chauffeur #{selectedTrip.id.slice(1, 4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trajet:</span>
                    <span className="font-medium">{selectedTrip.origin} → {selectedTrip.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Départ:</span>
                    <span className="font-medium">{selectedTrip.departureTime || 'ASAP'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-medium">{selectedTrip.priceCollective} TND</span>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5" />
                  <p>
                    Pour des raisons de sécurité, votre carte d’identité sera vérifiée par le chauffeur au moment de la prise en charge. Assurez-vous d’avoir vos documents sur vous.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Nombre de passagers</label>
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value, 10))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {Array.from({ length: selectedTrip.availableSeats }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {bookingStep === 'details' ? (
                  <>
                    <div>
                      <label className="text-sm font-bold text-gray-700">Bagages</label>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600">
                          Capacité du chauffeur: {getTotalCapacity()} articles au total
                        </div>
                        <div className="text-sm text-gray-600">
                          Votre sélection: {getTotalLuggage()} article{getTotalLuggage() > 1 ? 's' : ''}
                        </div>
                        {isTotalLuggageCapacityReached() && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={12} className="inline mr-1" />
                            Capacité maximale atteinte! Vous ne pouvez pas ajouter plus de bagages.
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'sac', label: 'Sac', price: 2 },
                          { key: 'petiteValise', label: 'Petite valise', price: 5 },
                          { key: 'moyenneValise', label: 'Moyenne valise', price: 8 },
                          { key: 'grandeValise', label: 'Grande valise', price: 12 }
                        ].map((type) => (
                          <div key={type.key} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                            <span className="text-sm font-bold">{type.label}</span>
                            <span className="text-xs text-gray-500">
                              ({type.price} TND) - {luggageDetails[type.key as keyof typeof luggageDetails]}/{driverLuggageCapacity[type.key as keyof typeof driverLuggageCapacity]}
                            </span>
                            <button
                              onClick={() => updateLuggage(type.key as any, -1)}
                              disabled={luggageDetails[type.key as keyof typeof luggageDetails] <= 0}
                              className={`w-6 h-6 text-white rounded text-xs transition-colors ${luggageDetails[type.key as keyof typeof luggageDetails] <= 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                              -
                            </button>
                            <span className="text-sm font-bold w-4 text-center">
                              {luggageDetails[type.key as keyof typeof luggageDetails]}
                            </span>
                            <button
                              onClick={() => updateLuggage(type.key as any, 1)}
                              disabled={luggageDetails[type.key as keyof typeof luggageDetails] >= driverLuggageCapacity[type.key as keyof typeof driverLuggageCapacity] || isTotalLuggageCapacityReached()}
                              className={`w-6 h-6 text-white rounded text-xs transition-colors ${luggageDetails[type.key as keyof typeof luggageDetails] >= driverLuggageCapacity[type.key as keyof typeof driverLuggageCapacity] || isTotalLuggageCapacityReached()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {getTotalLuggage()} article{getTotalLuggage() > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700">Message pour le chauffeur</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Précisez les détails importants..."
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-900">Choisissez votre moyen de paiement</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {paymentOptions.map((option) => {
                          const isActive = paymentMethod === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => setPaymentMethod(option.id)}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isActive
                                ? 'border-blue-600 bg-blue-50 text-blue-900'
                                : 'border-gray-200 hover:border-blue-200'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {option.renderIcon(isActive)}
                                <div className="text-left">
                                  <div className="font-bold">{option.label}</div>
                                  <div className="text-xs opacity-70">{option.description}</div>
                                </div>
                              </div>
                              {isActive && <CheckCircle2 size={18} className="text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                      {paymentMethod === 'cash' && (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
                          <AlertCircle className="text-orange-600 mt-0.5" size={16} />
                          <p className="text-sm text-orange-900">
                            <span className="font-black">Important :</span> Le paiement en espèces doit être effectué auprès du chauffeur dès son arrivée, avant de charger les bagages.
                          </p>
                        </div>
                      )}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-700">Sélectionnez une carte</h4>
                          <button
                            onClick={() => setShowSettingsModal(true) || setActiveSettingsTab('payment')}
                            className="text-xs font-bold text-blue-700 hover:underline"
                          >
                            Gérer mes cartes
                          </button>
                        </div>
                        {paymentCards.length === 0 ? (
                          <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
                            Aucune carte enregistrée. Ajoutez-en une depuis les paramètres.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {paymentCards.map((card) => (
                              <label
                                key={card.id}
                                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${selectedCardId === card.id
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-200'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="selected-card"
                                    checked={selectedCardId === card.id}
                                    onChange={() => setSelectedCardId(card.id)}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <div>
                                    <div className="font-bold text-gray-900">
                                      {card.brand} •••• {card.last4}
                                    </div>
                                    <div className="text-xs text-gray-500">Expiration {card.expiry}</div>
                                  </div>
                                </div>
                                {card.isDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                                    Par défaut
                                  </span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-[#2F2E2E] text-white p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Trajet ({passengerCount} pass.)</span>
                    <span>{priceDetails.base.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Frais bagages</span>
                    <span>{priceDetails.luggage.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Frais de service</span>
                    <span>{priceDetails.service.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>TVA (19%)</span>
                    <span>{priceDetails.vat.toFixed(3)} TND</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <span className="font-black block text-lg">Total TTC</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">TVA incluse</span>
                    </div>
                    <span className="text-2l font-black text-accent">{priceDetails.total.toFixed(3)} TND</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePrimaryAction}
                  disabled={isPrimaryDisabled}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isPrimaryDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    }`}
                >
                  {isPrimaryDisabled ? (
                    <>
                      <AlertCircle size={20} />
                      Capacité maximale atteinte
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      {bookingStep === 'details' ? 'Passer au paiement' : 'Confirmer la réservation'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCloseConfirmModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerApp;
