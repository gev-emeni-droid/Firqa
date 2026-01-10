
import React from 'react';
import { ArrowRight, Car, Shield, Users, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import { COLORS } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2F2E2E]">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#D5BDAF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#D5BDAF]/30">F</div>
          <span className="text-3xl font-black tracking-tighter text-[#2F2E2E]">Firqa</span>
        </div>
        <div className="hidden md:flex items-center gap-10 font-bold text-[#7D4F50]">
          <a href="#features" className="hover:text-[#B08968] transition-colors">Services</a>
          <a href="#pro" className="hover:text-[#B08968] transition-colors">Espace Pro</a>
          <a href="#about" className="hover:text-[#B08968] transition-colors">Notre vision</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="text-[#2F2E2E] font-bold hover:text-[#B08968] px-5 py-2 transition-all">Connexion</button>
          <button onClick={onGetStarted} className="bg-[#2F2E2E] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#D5BDAF] transition-all shadow-2xl shadow-gray-200">Rejoindre</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#D5BDAF]/10 border border-[#D5BDAF]/30 rounded-full text-[#B08968] font-black text-xs uppercase tracking-widest">
            Le futur du voyage Tunisien
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[#2F2E2E] leading-[0.95] tracking-tight">
            Voyagez <span className="text-[#D5BDAF]">élégamment</span>, travaillez <span className="text-[#7D4F50]">librement</span>.
          </h1>
          <p className="text-xl text-[#7D4F50] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Firqa est la seule application qui ne taxe pas les chauffeurs mais les rémunère : plus vous roulez, plus vous gagnez, sans commission cachée. Nous redéfinissons l'expérience du louage en Tunisie avec une plateforme intuitive, une gestion financière intelligente et un confort inégalé.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <button onClick={onGetStarted} className="bg-[#D5BDAF] text-white px-10 py-6 rounded-3xl font-black text-2xl hover:bg-[#B08968] transition-all shadow-[0_20px_40px_rgba(213,189,175,0.4)] flex items-center justify-center gap-4 group">
              C'est parti <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="bg-white border-2 border-[#D5BDAF]/20 text-[#2F2E2E] px-10 py-6 rounded-3xl font-bold text-xl hover:bg-[#F5EBE0] transition-all shadow-sm">
              En savoir plus
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-tr from-[#D5BDAF] to-[#F5EBE0] rounded-full blur-[100px] opacity-30"></div>
          <div className="relative bg-[#2F2E2E] rounded-[4rem] p-5 shadow-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto transform rotate-2">
             <img src="https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2069&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale-20" alt="Minimalist Car" />
             <div className="absolute bottom-10 left-10 right-10 glass-morphism p-8 rounded-[2.5rem] text-[#2F2E2E]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-[#D5BDAF] p-3 rounded-2xl text-white shadow-lg"><Car size={24} /></div>
                  <div className="font-black text-xl">Service Firqa</div>
                </div>
                <div className="text-3xl font-black mb-1">Qualité Premium</div>
                <div className="text-sm font-bold text-[#7D4F50] uppercase tracking-widest">Le confort au meilleur prix</div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#F5EBE0] py-32 px-6 rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-5">
             <h2 className="text-5xl md:text-6xl font-black text-[#2F2E2E] leading-tight">Une solution pensée <br/><span className="text-[#D5BDAF]">pour chaque acteur.</span></h2>
             <p className="text-[#7D4F50] max-w-2xl mx-auto font-medium text-lg">La technologie au service de l'humain et de l'efficacité économique.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Car className="text-[#B08968]" size={40} />} 
              title="Chauffeurs" 
              description="Maximisez vos revenus grâce à l'IA financière et réduisez vos frais d'abonnement selon votre performance."
              features={['Pack Pro dégressif', 'Gestion IA des profits', 'Acquisition clients QR']}
              color="bg-[#FAF7F2]"
            />
            <FeatureCard 
              icon={<Users className="text-[#7D4F50]" size={40} />} 
              title="Passagers" 
              description="Réservez vos places et vos bagages instantanément. Voyagez sereinement avec des tarifs fixes."
              features={['Réservation Bagages Incluse', 'Suivi Temps Réel', 'Paiement Sécurisé']}
              color="bg-white"
            />
            <FeatureCard 
              icon={<Shield className="text-[#2F2E2E]" size={40} />} 
              title="Institutions" 
              description="Accédez à des données précises pour réguler le trafic et moderniser les gares routières."
              features={['Tableau de bord régulateur', 'Suivi conformité', 'Statistiques nationales']}
              color="bg-[#FAF7F2]"
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#2F2E2E] text-[#D5BDAF] py-20 px-6 text-center">
         <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D5BDAF] rounded-2xl flex items-center justify-center text-white font-black text-2xl">F</div>
              <span className="text-4xl font-black tracking-tighter text-white">Firqa</span>
            </div>
            <p className="max-w-md opacity-70 font-medium">L'innovation au cœur de la Tunisie. Propulsez vos trajets vers une nouvelle ère.</p>
            <div className="flex gap-10 font-black text-sm uppercase tracking-widest border-t border-[#D5BDAF]/10 pt-10 w-full justify-center">
               <a href="#" className="hover:text-white transition-colors">Politique</a>
               <a href="#" className="hover:text-white transition-colors">Aide</a>
               <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-xs opacity-40 mt-10">© 2025 Firqa Tunisia. Tous droits réservés.</p>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, features, color }: any) => (
  <div className={`${color} p-12 rounded-[3.5rem] shadow-sm border border-[#D5BDAF]/10 hover:shadow-2xl hover:-translate-y-3 transition-all group relative overflow-hidden`}>
    <div className="bg-[#F5EBE0] w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-[#D5BDAF]/20 transition-all">
      {icon}
    </div>
    <h3 className="text-3xl font-black mb-5 text-[#2F2E2E]">{title}</h3>
    <p className="text-[#7D4F50] mb-10 leading-relaxed font-medium">{description}</p>
    <ul className="space-y-4">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center gap-4 text-sm font-bold text-[#2F2E2E]">
          <CheckCircle2 size={20} className="text-[#B08968]" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
