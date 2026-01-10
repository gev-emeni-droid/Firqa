
import React, { useState, useEffect } from 'react';
import { UserRole, BookingRequest, Trip, Notification } from './types';
import DriverCockpit from './components/DriverCockpit';
import PassengerApp from './components/PassengerApp';
import AdminApp from './components/AdminApp';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { LogOut, Menu, X, User, Bell } from 'lucide-react';
import { COLORS } from './constants';
import { notificationService } from './services/notificationService';
import { profileService } from './services/profileService';
import DriverProfile from './components/DriverProfile';
import { ChevronDown, Settings as SettingsIcon, DollarSign, Wallet as WalletIcon, Lock, History, Route } from 'lucide-react';
import DriverSettings from './components/DriverSettings';
import DriverWallet from './components/DriverWallet';
import CompletedTrips from './components/CompletedTrips';
import PrivateTrips from './components/PrivateTrips';
import PricingSettings from './components/PricingSettings';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('userRole') as UserRole || null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showPrivatizationMenu, setShowPrivatizationMenu] = useState(false);

  // Modal States for Driver
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showCompletedTrips, setShowCompletedTrips] = useState(false);
  const [showPricingSettings, setShowPricingSettings] = useState(false);
  const [pricingActiveTab, setPricingActiveTab] = useState<'collective' | 'privatization'>('collective');
  const [showPrivateTrips, setShowPrivateTrips] = useState(false);

  // Simulation de base de données partagée
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [trips, setTrips] = useState<Trip[]>([
    { id: 't1', driverId: 'd1', origin: 'Tunis', destination: 'Sousse', departureTime: '14:30', priceCollective: 8, pricePrivate: 60, availableSeats: 8, totalSeats: 8, isPrivate: false, status: 'pending' },
    { id: 't2', driverId: 'd2', origin: 'Sfax', destination: 'Tunis', departureTime: '16:00', priceCollective: 12, pricePrivate: 90, availableSeats: 5, totalSeats: 8, isPrivate: false, status: 'pending' },
  ]);

  // Initialiser les notifications et le routage
  useEffect(() => {
    notificationService.subscribe(setNotifications);
    notificationService.requestPermission();

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      notificationService.unsubscribe(setNotifications);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Persister la session
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (role) localStorage.setItem('userRole', role);
    else localStorage.removeItem('userRole');
  }, [isLoggedIn, role]);

  // Générer l'ID utilisateur basé sur le rôle
  const getCurrentUserId = () => {
    return role === UserRole.DRIVER ? 'd1' : role === UserRole.PASSENGER ? 'p1' : 'admin';
  };

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setShowAuth(false);
  };

  const triggerAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const addBookingRequest = (req: BookingRequest) => {
    setRequests(prev => [req, ...prev]);

    // Notifier le chauffeur concerné
    const trip = trips.find(t => t.id === req.tripId);
    if (trip) {
      notificationService.notifyBookingRequest(
        trip.driverId,
        req.passengerName,
        req.route
      );
    }
  };

  const handleRequestStatus = (id: string, status: 'accepted' | 'declined') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

    // Notifier le passager
    const trip = trips.find(t => t.id === req.tripId);
    if (trip) {
      if (status === 'accepted') {
        notificationService.notifyBookingAccepted(
          getCurrentUserId(), // Simplifié pour la démo
          'Chauffeur Firqa',
          req.route
        );

        setTrips(prev => prev.map(t =>
          t.id === req.tripId
            ? { ...t, availableSeats: Math.max(0, t.availableSeats - req.passengerCount) }
            : t
        ));
      } else {
        notificationService.notifyBookingDeclined(
          getCurrentUserId(),
          'Chauffeur Firqa',
          req.route
        );
      }
    }
  };

  if (currentPath.startsWith('/driver-profile/')) {
    const driverId = currentPath.split('/').pop() || 'd1';
    const driver = profileService.getProfile(driverId) || profileService.getProfile('d1');

    return (
      <div className="min-h-screen bg-[#F5EBE0]">
        <DriverProfile
          driver={driver}
          onClose={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }}
          onToggleFavorite={() => { }}
          isFavorite={false}
        />
      </div>
    );
  }

  if (!isLoggedIn && !showAuth) {
    return <LandingPage onGetStarted={() => triggerAuth('signup')} onLogin={() => triggerAuth('login')} />;
  }

  if (showAuth) {
    return <AuthPage mode={authMode} onBack={() => setShowAuth(false)} onAuthSuccess={handleLogin} setMode={setAuthMode} />;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const unreadNotificationsCount = notificationService.getUnreadCount(getCurrentUserId());
  const driverProfile = role === UserRole.DRIVER ? profileService.getProfile(getCurrentUserId()) : null;
  const firstName = driverProfile?.name.split(' ')[0] || 'Chauffeur';

  return (
    <div className="min-h-screen bg-[#F5EBE0] text-[#2F2E2E] pb-20 md:pb-0">
      {/* Navbar Persistante */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#E3D5CA] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLoggedIn(true)}>
          <div className="w-10 h-10 bg-[#D5BDAF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#D5BDAF]/20">F</div>
          <span className="text-2xl font-black tracking-tighter text-[#2F2E2E]">Firqa</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {role === UserRole.DRIVER && pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7D4F50]/10 text-[#7D4F50] rounded-full animate-pulse border border-[#7D4F50]/20">
              <Bell size={16} />
              <span className="text-xs font-black">{pendingCount} demande{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 bg-blue-10 text-blue-600 rounded-full border border-blue-20 hover:bg-blue-20 transition-colors"
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
            <span className="text-xs font-black">Notifications</span>
          </button>

          {role === UserRole.DRIVER ? (
            <div className="flex items-center gap-4">
              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowMainMenu(!showMainMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D5BDAF] to-[#B08968] text-white rounded-full font-black text-sm shadow-lg shadow-[#D5BDAF]/20 hover:scale-105 transition-all"
                >
                  <Menu size={16} />
                  Menu
                </button>

                {showMainMenu && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#D5BDAF]/20 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => { setPricingActiveTab('collective'); setShowPricingSettings(true); setShowMainMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2F2E2E] hover:bg-[#F5EBE0] transition-colors"
                    >
                      <Route size={18} className="text-[#B08968]" />
                      Paramètres tarifaires
                    </button>
                    <div className="border-t border-[#D5BDAF]/10 my-2" />
                    <div className="px-5 py-2 text-[10px] font-black text-[#7D4F50] uppercase tracking-widest opacity-50">Gestion</div>
                    <button
                      onClick={() => { setShowWallet(true); setShowMainMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2F2E2E] hover:bg-[#F5EBE0] transition-colors"
                    >
                      <WalletIcon size={18} className="text-[#B08968]" />
                      Mon portefeuille
                    </button>
                    <button
                      onClick={() => { setShowPrivateTrips(true); setShowMainMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2F2E2E] hover:bg-[#F5EBE0] transition-colors"
                    >
                      <Lock size={18} className="text-[#B08968]" />
                      Mes privatisations
                    </button>
                    <button
                      onClick={() => { setShowCompletedTrips(true); setShowMainMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2F2E2E] hover:bg-[#F5EBE0] transition-colors"
                    >
                      <History size={18} className="text-[#B08968]" />
                      Mes trajets effectués
                    </button>
                  </div>
                )}
              </div>

              {/* User Name with Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FAF7F2] rounded-full border border-[#D5BDAF]/30 hover:bg-white transition-all group"
                >
                  <div className="w-8 h-8 bg-[#D5BDAF] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {firstName.charAt(0)}
                  </div>
                  <span className="text-sm font-black text-[#7D4F50] group-hover:text-[#2F2E2E]">
                    {firstName}
                  </span>
                  <ChevronDown size={14} className={`text-[#B08968] transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} />
                </button>

                {showAccountMenu && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#D5BDAF]/20 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => { setShowSettings(true); setShowAccountMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2F2E2E] hover:bg-[#F5EBE0] transition-colors"
                    >
                      <SettingsIcon size={18} className="text-[#B08968]" />
                      Paramètre de compte
                    </button>
                    <div className="border-t border-[#D5BDAF]/10 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5EBE0] rounded-full border border-[#D5BDAF]/30">
              <User size={16} className="#B08968" />
              <span className="text-sm font-bold text-[#7D4F50]">
                {role === UserRole.PASSENGER ? 'Passager' : 'Admin'}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`hidden ${role === UserRole.DRIVER ? 'md:hidden' : 'md:flex'} items-center gap-2 text-[#7D4F50] hover:text-black font-bold text-sm transition-colors`}
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        <button className="md:hidden p-2 text-[#7D4F50]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#F5EBE0] p-6 pt-24 flex flex-col gap-6">
          <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-[#D5BDAF]/20">
            <div className="w-14 h-14 bg-[#D5BDAF] rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase">
              {role?.charAt(0)}
            </div>
            <div>
              <div className="font-black text-xl capitalize text-[#2F2E2E]">{role?.toLowerCase()}</div>
              <div className="text-sm text-[#7D4F50]">Membre Firqa Premium</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="p-4 bg-white rounded-2xl font-bold text-left border border-[#D5BDAF]/10">Mon Profil</button>
            <button className="p-4 bg-white rounded-2xl font-bold text-left border border-[#D5BDAF]/10">Paramètres</button>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-4 text-white bg-[#7D4F50] p-5 rounded-3xl text-xl font-black mt-auto shadow-xl shadow-[#7D4F50]/20">
            <LogOut /> Déconnexion
          </button>
        </div>
      )}

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {role === UserRole.DRIVER && (
          <DriverCockpit
            trips={trips}
            setTrips={setTrips}
            requests={requests}
            onHandleRequest={handleRequestStatus}
          />
        )}
        {role === UserRole.PASSENGER && (
          <PassengerApp
            trips={trips}
            onRequestBooking={handleRequestStatus}
            userRequests={requests.filter(r => r.passengerName === 'Moi')}
          />
        )}
        {role === UserRole.ADMIN && <AdminApp />}

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucune notification</p>
                    <p className="text-sm">Vous serez notifié des nouvelles activités</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all ${notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900">{notification.title}</h3>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${notification.type === 'booking_request' ? 'bg-blue-100 text-blue-700' :
                            notification.type === 'booking_accepted' ? 'bg-green-100 text-green-700' :
                              notification.type === 'booking_cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {notification.type === 'booking_request' ? 'Demande de réservation' :
                              notification.type === 'booking_accepted' ? 'Réservation acceptée' :
                                notification.type === 'booking_cancelled' ? 'Réservation annulée' :
                                  'Information'}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => notificationService.markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    notificationService.markAllAsRead(getCurrentUserId());
                    setShowNotifications(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Marquer toutes comme lues
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Driver Modals */}
        {showSettings && (
          <DriverSettings userId={getCurrentUserId()} onClose={() => setShowSettings(false)} />
        )}
        {showWallet && (
          <DriverWallet driverId={getCurrentUserId()} onClose={() => setShowWallet(false)} />
        )}
        {showCompletedTrips && (
          <CompletedTrips driverId={getCurrentUserId()} onClose={() => setShowCompletedTrips(false)} />
        )}
        {showPricingSettings && (
          <PricingSettings
            driverId={getCurrentUserId()}
            onClose={() => setShowPricingSettings(false)}
            initialTab={pricingActiveTab}
          />
        )}
        {showPrivateTrips && (
          <PrivateTrips driverId={getCurrentUserId()} onClose={() => setShowPrivateTrips(false)} />
        )}
      </main>
    </div>
  );
};

export default App;
