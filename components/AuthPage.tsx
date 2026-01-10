
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ArrowLeft, Car, User, ShieldCheck, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import DriverRegistration from './DriverRegistration';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onBack: () => void;
  onAuthSuccess: (role: UserRole) => void;
  setMode: (mode: 'login' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onBack, onAuthSuccess, setMode }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PASSENGER);
  const [showPassword, setShowPassword] = useState(false);
  const [showFullRegistration, setShowFullRegistration] = useState(false);

  const handleAuthSubmit = () => {
    if (mode === 'signup' && selectedRole === UserRole.DRIVER) {
      setShowFullRegistration(true);
    } else {
      onAuthSuccess(selectedRole);
    }
  };

  if (showFullRegistration) {
    return (
      <div className="min-h-screen bg-[#F5EBE0] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowFullRegistration(false)}
            className="mb-8 flex items-center gap-2 text-[#7D4F50] font-black hover:text-[#2F2E2E] transition-all uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={20} /> Retour
          </button>
          <DriverRegistration onComplete={() => onAuthSuccess(UserRole.DRIVER)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        <button onClick={onBack} className="flex items-center gap-2 text-[#7D4F50] font-black hover:text-[#2F2E2E] transition-all uppercase tracking-widest text-xs">
          <ArrowLeft size={20} /> Retour à l'accueil
        </button>

        <div className="bg-white p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(125,79,80,0.15)] space-y-8 border border-[#D5BDAF]/10">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-[#D5BDAF] rounded-[2rem] flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-2xl shadow-[#D5BDAF]/30 animate-in zoom-in duration-300">F</div>
            <h2 className="text-4xl font-black text-[#2F2E2E] tracking-tight">{mode === 'login' ? 'Bon retour' : 'Bienvenue'}</h2>
            <p className="text-[#7D4F50] font-medium leading-relaxed">Prêt à réinventer vos déplacements ? <br />Choisissez votre espace.</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-3 p-2 bg-[#F5EBE0]/50 rounded-[2rem] border border-[#D5BDAF]/10">
            <button
              onClick={() => setSelectedRole(UserRole.PASSENGER)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all relative ${selectedRole === UserRole.PASSENGER ? 'bg-white shadow-xl text-[#B08968]' : 'text-gray-400 opacity-60'}`}
            >
              <User size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Passager</span>
              {selectedRole === UserRole.PASSENGER && <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#B08968]" />}
            </button>
            <button
              onClick={() => setSelectedRole(UserRole.DRIVER)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all relative ${selectedRole === UserRole.DRIVER ? 'bg-white shadow-xl text-[#B08968]' : 'text-gray-400 opacity-60'}`}
            >
              <Car size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Chauffeur</span>
              {selectedRole === UserRole.DRIVER && <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#B08968]" />}
            </button>
            <button
              onClick={() => setSelectedRole(UserRole.ADMIN)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all relative ${selectedRole === UserRole.ADMIN ? 'bg-white shadow-xl text-[#B08968]' : 'text-gray-400 opacity-60'}`}
            >
              <ShieldCheck size={24} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Admin</span>
              {selectedRole === UserRole.ADMIN && <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#B08968]" />}
            </button>
          </div>

          <div className="space-y-5 pt-2">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D5BDAF] transition-colors" size={20} />
              <input
                type="email"
                placeholder="Adresse Email"
                className="w-full p-5 pl-14 bg-[#F5EBE0]/30 border border-[#D5BDAF]/20 rounded-3xl focus:ring-4 focus:ring-[#D5BDAF]/10 outline-none transition-all font-medium text-[#2F2E2E]"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D5BDAF] transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full p-5 pl-14 bg-[#F5EBE0]/30 border border-[#D5BDAF]/20 rounded-3xl focus:ring-4 focus:ring-[#D5BDAF]/10 outline-none transition-all font-medium text-[#2F2E2E]"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#B08968] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={handleAuthSubmit}
              className="w-full bg-[#2F2E2E] text-white p-6 rounded-[2rem] font-black text-xl hover:bg-[#D5BDAF] transition-all shadow-2xl shadow-gray-200 mt-4 active:scale-95"
            >
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>

            <div className="text-center pt-2">
              <p className="text-[#7D4F50] text-sm font-bold">
                {mode === 'login' ? "Nouveau ici ?" : "Déjà un compte ?"}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-[#B08968] font-black hover:underline underline-offset-4"
                >
                  {mode === 'login' ? "S'inscrire gratuitement" : "Connexion"}
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#7D4F50] font-medium opacity-60">
          En vous connectant, vous acceptez nos Conditions Générales d'Utilisation.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
