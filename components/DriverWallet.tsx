import React, { useState } from 'react';
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertCircle, X, Download, CreditCard, Banknote, ShieldCheck, Info } from 'lucide-react';
import { Transaction } from '../types';
import { profileService } from '../services/profileService';

interface DriverWalletProps {
    driverId: string;
    onClose: () => void;
}

type WalletTransaction = Transaction & {
    source: 'auto' | 'manual';
};

const DriverWallet: React.FC<DriverWalletProps> = ({ driverId, onClose }) => {
    const TVA_RATE = 0.19;
    const [profile, setProfile] = useState(() => profileService.getProfile(driverId));
    const [balance, setBalance] = useState(485.50);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([
        { id: 'w1', type: 'income', amount: 45.00, category: 'Course Carte', date: '2023-11-20', description: 'Paiement carte Tunis-Sousse', source: 'auto' },
        { id: 'w2', type: 'income', amount: 120.00, category: 'Privatisation', date: '2023-11-19', description: 'Paiement carte Sfax-Tunis', source: 'auto' },
        { id: 'w3', type: 'expense', amount: 300.00, category: 'Virement', date: '2023-11-15', description: 'Virement vers BIAT ****5678', source: 'auto' },
        { id: 'w4', type: 'income', amount: 65.00, category: 'Course Carte', date: '2023-11-14', description: 'Paiement carte Nabeul-Tunis', source: 'auto' },
    ]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);
    const [manualIncome, setManualIncome] = useState({ label: '', amount: '' });
    const [manualExpense, setManualExpense] = useState({ label: '', amount: '' });

    const hasRIB = profile?.bankDetails?.iban && profile?.bankDetails?.bankName;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netResult = totalIncome - totalExpense;
    const tvaDue = totalIncome * TVA_RATE;
    const netAfterTva = netResult - tvaDue;

    const addManualEntry = (entryType: 'income' | 'expense') => {
        const currentForm = entryType === 'income' ? manualIncome : manualExpense;
        const amount = parseFloat(currentForm.amount);

        if (!currentForm.label.trim() || isNaN(amount) || amount <= 0) {
            alert('Merci de renseigner un libellé et un montant valide.');
            return;
        }

        const newTransaction: WalletTransaction = {
            id: `manual-${Date.now()}`,
            type: entryType,
            amount,
            category: entryType === 'income' ? 'Revenu manuel' : 'Dépense manuelle',
            date: new Date().toISOString().split('T')[0],
            description: currentForm.label.trim(),
            source: 'manual'
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setBalance(prev => prev + (entryType === 'income' ? amount : -amount));

        if (entryType === 'income') {
            setManualIncome({ label: '', amount: '' });
        } else {
            setManualExpense({ label: '', amount: '' });
        }
    };

    const handleRequestTransfer = () => {
        if (!hasRIB) {
            alert("Veuillez configurer votre RIB dans les paramètres avant de demander un virement.");
            return;
        }
        setShowTransferModal(true);
    };

    const confirmTransfer = () => {
        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Veuillez entrer un montant valide.");
            return;
        }
        if (amount > balance) {
            alert("Solde insuffisant.");
            return;
        }

        setIsProcessing(true);
        // Simulation du virement
        setTimeout(() => {
            const newTransaction: WalletTransaction = {
                id: `w${Date.now()}`,
                type: 'expense',
                amount: amount,
                category: 'Virement',
                date: new Date().toISOString().split('T')[0],
                description: `Virement vers ${profile?.bankDetails?.bankName} ****${profile?.bankDetails?.iban.slice(-4)}`,
                source: 'auto'
            };
            setTransactions([newTransaction, ...transactions]);
            setBalance(prev => prev - amount);
            setIsProcessing(false);
            setTransferSuccess(true);
            setTimeout(() => {
                setTransferSuccess(false);
                setShowTransferModal(false);
                setTransferAmount('');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#2F2E2E]/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
            <div className="bg-[#FAF7F2] w-full max-w-5xl h-full max-h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col relative animate-in zoom-in duration-300">

                {/* Header */}
                <div className="p-8 md:p-10 bg-white border-b border-[#D5BDAF]/20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#D5BDAF]/20 p-4 rounded-2xl text-[#B08968]">
                            <Wallet size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#2F2E2E] tracking-tight">Mon portefeuille</h2>
                            <p className="text-[#7D4F50] font-bold text-sm">Suivez votre chiffre d'affaires réel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-[#F5EBE0] rounded-full transition-all text-[#7D4F50]">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Balance Card */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#2F2E2E] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#D5BDAF] rounded-full blur-[80px] opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="text-[#D5BDAF] font-black uppercase tracking-[0.2em] text-xs mb-4">Solde Disponible</div>
                                    <div className="text-6xl font-black mb-10 flex items-baseline gap-2">
                                        {balance.toFixed(2)} <span className="text-2xl text-[#D5BDAF]">TND</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={handleRequestTransfer}
                                            className="bg-white text-[#2F2E2E] px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#D5BDAF] hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                        >
                                            <ArrowUpFromLine size={20} /> Demander un virement
                                        </button>
                                        {!hasRIB && (
                                            <div className="flex items-center gap-2 bg-orange-500/20 text-orange-200 px-4 py-2 rounded-xl text-xs font-bold border border-orange-500/30">
                                                <AlertCircle size={14} /> RIB non configuré
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-[2rem] border border-[#D5BDAF]/20">
                                    <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest">Revenus totaux</p>
                                    <p className="text-2xl font-black text-[#2F2E2E]">{totalIncome.toFixed(2)} TND</p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-[#D5BDAF]/20">
                                    <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest">Dépenses totales</p>
                                    <p className="text-2xl font-black text-[#2F2E2E]">{totalExpense.toFixed(2)} TND</p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-[#D5BDAF]/20">
                                    <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest">Bénéfice net</p>
                                    <p className={`text-2xl font-black ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {netResult.toFixed(2)} TND
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-[#D5BDAF]/20">
                                    <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest">TVA 19% à reverser</p>
                                    <p className="text-2xl font-black text-[#B08968]">{tvaDue.toFixed(2)} TND</p>
                                </div>
                            </div>

                            <div className="bg-[#FAF7F2] border border-[#D5BDAF]/30 rounded-[2rem] p-5 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-[#7D4F50]">
                                    <Info size={16} /> Revenu net après TVA (à conserver)
                                </div>
                                <div className={`text-3xl font-black ${netAfterTva >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                    {netAfterTva.toFixed(2)} TND
                                </div>
                                <p className="text-xs text-[#7D4F50]/70">
                                    Calculé comme bénéfice net – TVA (19%) due à l'application.
                                </p>
                            </div>

                            {/* Transactions History */}
                            <div>
                                <h3 className="text-2xl font-black text-[#2F2E2E] mb-6 flex items-center gap-3">
                                    <TrendingUp className="text-[#B08968]" /> Historique des mouvements
                                </h3>
                                <div className="space-y-4">
                                    {transactions.map(t => (
                                        <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-[#D5BDAF]/10 flex justify-between items-center hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {t.type === 'income' ? <ArrowDownToLine size={24} /> : <ArrowUpFromLine size={24} />}
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg text-[#2F2E2E] group-hover:text-[#B08968] transition-colors">{t.category}</div>
                                                    <div className="text-xs text-[#7D4F50] font-bold uppercase tracking-widest mt-1 opacity-60">{t.date} • {t.description}</div>
                                                    {t.source === 'manual' && (
                                                        <span className="inline-flex mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#D5BDAF]/20 text-[#7D4F50]">
                                                            Saisie manuelle
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`text-xl font-black ${t.type === 'income' ? 'text-green-600' : 'text-[#2F2E2E]'}`}>
                                                {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} TND
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Tools */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[3rem] border border-[#D5BDAF]/10 space-y-6">
                                <h4 className="font-black text-xl text-[#2F2E2E]">Saisies manuelles</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest mb-2">Ajouter un revenu</p>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Libellé (ex: Course privée)"
                                                value={manualIncome.label}
                                                onChange={(e) => setManualIncome(prev => ({ ...prev, label: e.target.value }))}
                                                className="w-full p-3 border border-[#D5BDAF]/30 rounded-xl focus:border-[#B08968] focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Montant en TND"
                                                value={manualIncome.amount}
                                                onChange={(e) => setManualIncome(prev => ({ ...prev, amount: e.target.value }))}
                                                className="w-full p-3 border border-[#D5BDAF]/30 rounded-xl focus:border-[#B08968] focus:outline-none"
                                            />
                                            <button
                                                onClick={() => addManualEntry('income')}
                                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all"
                                            >
                                                Ajouter au chiffre d'affaires
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#7D4F50]/70 uppercase tracking-widest mb-2">Ajouter une dépense</p>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Libellé (ex: Carburant)"
                                                value={manualExpense.label}
                                                onChange={(e) => setManualExpense(prev => ({ ...prev, label: e.target.value }))}
                                                className="w-full p-3 border border-[#D5BDAF]/30 rounded-xl focus:border-[#B08968] focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Montant en TND"
                                                value={manualExpense.amount}
                                                onChange={(e) => setManualExpense(prev => ({ ...prev, amount: e.target.value }))}
                                                className="w-full p-3 border border-[#D5BDAF]/30 rounded-xl focus:border-[#B08968] focus:outline-none"
                                            />
                                            <button
                                                onClick={() => addManualEntry('expense')}
                                                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
                                            >
                                                Enregistrer la dépense
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[3rem] border border-[#D5BDAF]/10 space-y-6">
                                <h4 className="font-black text-xl text-[#2F2E2E]">Informations Bancaires</h4>
                                {hasRIB ? (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-[#F5EBE0]/30 rounded-2xl border border-[#D5BDAF]/10">
                                            <div className="text-[10px] font-black text-[#7D4F50] uppercase tracking-widest mb-1">Banque</div>
                                            <div className="font-black text-[#2F2E2E]">{profile?.bankDetails?.bankName}</div>
                                        </div>
                                        <div className="p-5 bg-[#F5EBE0]/30 rounded-2xl border border-[#D5BDAF]/10">
                                            <div className="text-[10px] font-black text-[#7D4F50] uppercase tracking-widest mb-1">Titulaire</div>
                                            <div className="font-black text-[#2F2E2E]">{profile?.bankDetails?.accountHolder}</div>
                                        </div>
                                        <div className="p-5 bg-[#F5EBE0]/30 rounded-2xl border border-[#D5BDAF]/10">
                                            <div className="text-[10px] font-black text-[#7D4F50] uppercase tracking-widest mb-1">IBAN</div>
                                            <div className="font-black text-[#2F2E2E] text-sm">{profile?.bankDetails?.iban}</div>
                                        </div>
                                        <button className="w-full text-xs font-black text-[#B08968] uppercase tracking-widest hover:underline py-2">Modifier mon RIB</button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 space-y-4">
                                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                                            <AlertCircle size={32} />
                                        </div>
                                        <p className="text-sm text-[#7D4F50] font-medium leading-relaxed">
                                            Veuillez configurer vos coordonnées bancaires pour recevoir vos virements.
                                        </p>
                                        <button className="bg-[#B08968] text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#2F2E2E] transition-all">
                                            Configurer
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-[#7D4F50] to-[#2F2E2E] p-8 rounded-[3rem] text-white relative overflow-hidden">
                                <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                                <h4 className="font-black text-lg mb-4">Paiements Sécurisés</h4>
                                <p className="text-xs text-white/70 leading-relaxed font-bold">
                                    Tous les paiements par carte sont garantis et versés sur votre cagnotte instantanément après la fin de la course.
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CreditCard size={20} /></div>
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Banknote size={20} /></div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[3rem] border border-[#D5BDAF]/10">
                                <h4 className="font-black text-xl text-[#2F2E2E] mb-4">Note de Frais</h4>
                                <p className="text-xs text-[#7D4F50] mb-6 font-medium">Téléchargez votre relevé mensuel pour votre comptabilité.</p>
                                <button className="w-full bg-[#FAF7F2] text-[#2F2E2E] py-4 rounded-2xl font-black flex items-center justify-center gap-3 border border-[#D5BDAF]/10 hover:bg-[#F5EBE0] transition-all">
                                    <Download size={20} /> Exporter PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-[3rem] p-10 space-y-8 shadow-2xl relative animate-in zoom-in duration-300">
                            {transferSuccess ? (
                                <div className="text-center space-y-6 py-10">
                                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                        <CheckCircle2 size={64} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-[#2F2E2E]">Virement Demandé !</h3>
                                        <p className="text-[#7D4F50] font-bold leading-relaxed">Votre demande est en cours de traitement. Le fonds arriveront sous 24-48h.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => setShowTransferModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24} /></button>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-[#2F2E2E]">Demander un virement</h3>
                                        <p className="text-sm text-[#7D4F50] font-bold">Transférez votre solde vers votre compte bancaire.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 bg-[#FAF7F2] rounded-[2rem] border border-[#D5BDAF]/20 text-center">
                                            <div className="text-[10px] font-black text-[#7D4F50] uppercase tracking-widest mb-2">Solde maximum</div>
                                            <div className="text-4xl font-black text-[#2F2E2E]">{balance.toFixed(2)} TND</div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#7D4F50] uppercase tracking-widest ml-1">Montant du virement (TND)</label>
                                            <input
                                                type="number"
                                                value={transferAmount}
                                                onChange={(e) => setTransferAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl font-black text-[#2F2E2E] text-4xl text-center focus:bg-white focus:border-[#D5BDAF] outline-none transition-all"
                                            />
                                        </div>

                                        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                            <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                                            <p className="text-[10px] text-blue-900 font-bold leading-normal">
                                                Ce virement sera effectué vers {profile?.bankDetails?.bankName} ({profile?.bankDetails?.iban.slice(0, 4)}...{profile?.bankDetails?.iban.slice(-4)})
                                            </p>
                                        </div>

                                        <button
                                            onClick={confirmTransfer}
                                            disabled={isProcessing}
                                            className="w-full bg-[#2F2E2E] text-white p-6 rounded-[2rem] font-black text-xl hover:bg-[#D5BDAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {isProcessing ? (
                                                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                'Confirmer le virement'
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverWallet;
