import React, { useState } from 'react';
import { X, Settings, User, Bell, Shield, CreditCard, Globe, HelpCircle, LogOut, Save, Camera, Upload, Check, Briefcase, Package, Luggage, Link2, DollarSign } from 'lucide-react';
import { profileService } from '../services/profileService';

interface DriverSettingsProps {
  userId: string;
  onClose: () => void;
}

interface LuggageCapacity {
  sac: number;
  petiteValise: number;
  moyenneValise: number;
  grandeValise: number;
}

const DriverSettings: React.FC<DriverSettingsProps> = ({ userId, onClose }) => {
  const profile = profileService.getProfile(userId);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'payment' | 'referral'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    notifications: profile?.preferences?.notifications ?? true,
    language: profile?.preferences?.language || 'fr',
    currency: profile?.preferences?.currency || 'TND',
    bankName: profile?.bankDetails?.bankName || '',
    accountHolder: profile?.bankDetails?.accountHolder || '',
    iban: profile?.bankDetails?.iban || ''
  });

  const [luggageCapacity, setLuggageCapacity] = useState<LuggageCapacity>({
    sac: profile?.luggageCapacity?.sac || 5,
    petiteValise: profile?.luggageCapacity?.petiteValise || 3,
    moyenneValise: profile?.luggageCapacity?.moyenneValise || 2,
    grandeValise: profile?.luggageCapacity?.grandeValise || 1
  });
  const [referralData] = useState({
    link: 'https://firqa.app/invite-driver/MONDHER95',
    invites: [
      { id: 'drv1', name: 'Hichem B.', revenue: 320 },
      { id: 'drv2', name: 'Nidhal S.', revenue: 140 },
      { id: 'drv3', name: 'Karim L.', revenue: 215 }
    ]
  });
  const [hasCopiedReferral, setHasCopiedReferral] = useState(false);

  const handleSave = () => {
    if (profile) {
      profileService.updateProfile(userId, {
        ...profile,
        ...formData,
        luggageCapacity,
        preferences: {
          notifications: formData.notifications,
          language: formData.language as 'fr' | 'ar',
          currency: formData.currency
        },
        bankDetails: {
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          iban: formData.iban,
          ribUrl: profile.bankDetails?.ribUrl // On garde l'ancien URL pour la démo
        }
      });
      setIsEditing(false);
    }
  };

  const updateLuggageCapacity = (type: keyof LuggageCapacity, delta: number) => {
    setLuggageCapacity(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(20, prev[type] + delta))
    }));
  };

  const setLuggageCapacityValue = (type: keyof LuggageCapacity, value: number) => {
    setLuggageCapacity(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(20, value))
    }));
  };

  const getTotalCapacity = () => {
    return luggageCapacity.sac + luggageCapacity.petiteValise + luggageCapacity.moyenneValise + luggageCapacity.grandeValise;
  };

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData.link);
      setHasCopiedReferral(true);
      setTimeout(() => setHasCopiedReferral(false), 2000);
    } catch (error) {
      console.error('copy failed', error);
    }
  };

  const getReferralBonus = () => {
    const qualified = referralData.invites.filter(invite => invite.revenue >= 200).length;
    return qualified * 5;
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'payment', label: 'Paiement', icon: CreditCard },
    { id: 'referral', label: 'Parrainage', icon: Link2 }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Paramètres du chauffeur</h2>
                <p className="text-white/80 text-sm">Gérez votre profil et vos préférences</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'text-[#B08968] border-b-2 border-[#B08968] bg-[#FAF7F2]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#F5EBE0] rounded-full flex items-center justify-center">
                  <User size={40} className="text-[#B08968]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                  <p className="text-gray-600">Chauffeur professionnel</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-[#B08968]" />
                    Sécurité (Changement de mot de passe)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        placeholder="•••••••••"
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        placeholder="•••••••••"
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        placeholder="•••••••••"
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Tab */}
          {activeTab === 'referral' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Programme Parrainage Chauffeur</h3>
                  <p className="text-sm text-blue-700">
                    Partagez votre lien. Dès qu’un filleul réalise 200 TND de chiffre d’affaires, vous gagnez 5 TND.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-900 font-black text-2xl">
                  <DollarSign size={20} />
                  {getReferralBonus().toFixed(2)} TND
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Votre lien personnel</label>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={referralData.link}
                    readOnly
                    className="flex-1 min-w-[200px] p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleCopyReferralLink}
                    className="px-4 py-3 bg-[#B08968] text-white rounded-xl font-bold hover:bg-[#8c6a4f] transition-all"
                  >
                    {hasCopiedReferral ? 'Lien copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mes filleuls</h4>
                {referralData.invites.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                    Vous n’avez pas encore invité de chauffeurs.
                  </div>
                ) : (
                  referralData.invites.map(invite => {
                    const qualified = invite.revenue >= 200;
                    return (
                      <div key={invite.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                        <div>
                          <div className="font-bold text-[#2F2E2E]">{invite.name}</div>
                          <div className={`text-xs font-bold px-3 py-1 rounded-full ${qualified ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                            {qualified ? '+5 TND crédités' : 'Condition non remplie'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Préférences générales</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notifications push</label>
                      <p className="text-xs text-gray-500">Recevoir des alertes pour les nouvelles demandes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      disabled={!isEditing}
                      className="w-5 h-5 text-[#B08968] border-gray-300 rounded focus:ring-[#B08968] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50"
                    >
                      <option value="TND">TND - Dinar Tunisien</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar Américain</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Méthodes de paiement</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Carte bancaire</div>
                          <div className="text-sm text-gray-500">•••• •••• •••• 4242</div>
                        </div>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Par défaut</span>
                    </div>
                  </div>
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#B08968] hover:text-[#B08968] transition-colors">
                    + Ajouter une méthode de paiement
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-[#B08968]" />
                  Informations de Virement (RIB)
                </h3>
                <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D5BDAF]/20 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Ex: BIAT, STB..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titulaire du compte</label>
                    <input
                      type="text"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Nom complet"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IBAN / RIB</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                      disabled={!isEditing}
                      placeholder="TN59..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#B08968] focus:outline-none disabled:bg-gray-50 font-mono font-bold"
                    />
                  </div>
                  {profile?.bankDetails?.ribUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                      <Check size={14} /> RIB vérifié et enregistré
                    </div>
                  )}
                  {isEditing && (
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modifier le justificatif RIB</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#B08968] transition-all cursor-pointer">
                        <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-bold">Cliquez pour uploader un nouveau RIB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[#D5BDAF] to-[#B08968] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Enregistrer les modifications
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-[#D5BDAF] to-[#B08968] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Settings size={20} />
                  Modifier les paramètres
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Fermer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSettings;
