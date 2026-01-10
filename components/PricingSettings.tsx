import React, { useState } from 'react';
import { X, Route, Plus, Edit2, Trash2, Save, Clock, MapPin, Users, DollarSign, Star, Info, Calculator, Package, Briefcase, Luggage } from 'lucide-react';
import { profileService } from '../services/profileService';
import { RoutePrivatePrice } from '../types';

interface TripTemplate {
    id: string;
    name: string;
    origin: string;
    destination: string;
    departureTime: string;
    priceCollective: number;
    pricePrivate: number;
    totalSeats: number;
    frequency: 'daily' | 'weekly' | 'custom';
    isActive: boolean;
    usageCount: number;
    averageRating: number;
    revenue: number;
}

const TUNISIAN_CITIES = [
    'Tunis', 'Sousse', 'Sfax', 'Monastir', 'Hammamet', 'Bizerte', 'Nabeul', 'Kairouan',
    'Djerba', 'Gabès', 'Ariana', 'Ben Arous', 'Mannouba', 'Zaghouan', 'Béja', 'Jendouba',
    'Le Kef', 'Siliana', 'Kasserine', 'Sidi Bouzid', 'Mahdia', 'Gafsa', 'Tozeur',
    'Kebili', 'Medenine', 'Tataouine'
];

interface LuggageCapacity {
    sac: number;
    petiteValise: number;
    moyenneValise: number;
    grandeValise: number;
}

interface PricingSettingsProps {
    driverId: string;
    onClose: () => void;
    initialTab?: 'collective' | 'privatization' | 'luggage';
}

const PricingSettings: React.FC<PricingSettingsProps> = ({ driverId, onClose, initialTab = 'collective' }) => {
    const [activeTab, setActiveTab] = useState<'collective' | 'privatization' | 'luggage'>(initialTab);

    // States from TripTemplates
    const [templates, setTemplates] = useState<TripTemplate[]>([
        {
            id: 'tpl1',
            name: 'Tunis → Sousse (Matin)',
            origin: 'Tunis',
            destination: 'Sousse',
            departureTime: '08:00',
            priceCollective: 8,
            pricePrivate: 60,
            totalSeats: 8,
            frequency: 'daily',
            isActive: true,
            usageCount: 45,
            averageRating: 4.8,
            revenue: 2880
        },
        {
            id: 'tpl2',
            name: 'Sousse → Tunis (Soir)',
            origin: 'Sousse',
            destination: 'Tunis',
            departureTime: '18:00',
            priceCollective: 10,
            pricePrivate: 70,
            totalSeats: 8,
            frequency: 'daily',
            isActive: true,
            usageCount: 38,
            averageRating: 4.7,
            revenue: 2660
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TripTemplate | null>(null);
    const [formData, setFormData] = useState<Partial<TripTemplate>>({
        name: '',
        origin: 'Tunis',
        destination: 'Sousse',
        departureTime: '',
        priceCollective: 8,
        pricePrivate: 60,
        totalSeats: 8,
        frequency: 'daily',
        isActive: true
    });

    // States from PricingManager
    const profile = profileService.getProfile(driverId);
    const [routePrivatePrices, setRoutePrivatePrices] = useState<RoutePrivatePrice[]>(
        profile?.privatizationPrices || []
    );
    const [newRoutePrice, setNewRoutePrice] = useState<RoutePrivatePrice>({
        id: '',
        origin: '',
        destination: '',
        basePrice: 0
    });
    const [editingRoute, setEditingRoute] = useState<RoutePrivatePrice | null>(null);

    const resetNewRouteForm = () => {
        setNewRoutePrice({
            id: '',
            origin: '',
            destination: '',
            basePrice: 0
        });
    };

    const handleAddRoutePrice = () => {
        if (!newRoutePrice.origin || !newRoutePrice.destination || newRoutePrice.basePrice <= 0) return;
        setRoutePrivatePrices(prev => [
            ...prev,
            { ...newRoutePrice, id: Date.now().toString() }
        ]);
        resetNewRouteForm();
    };

    const handleEditRoute = (route: RoutePrivatePrice) => {
        setEditingRoute({ ...route });
    };

    const updateEditingRouteField = (field: keyof RoutePrivatePrice, value: string) => {
        setEditingRoute(prev => prev ? {
            ...prev,
            [field]: field === 'basePrice' ? parseInt(value) || 0 : value
        } : prev);
    };

    const handleSaveEditedRoute = () => {
        if (!editingRoute) return;
        setRoutePrivatePrices(prev =>
            prev.map(route => route.id === editingRoute.id ? editingRoute : route)
        );
        setEditingRoute(null);
    };

    // Luggage Capacity State
    const [luggageCapacity, setLuggageCapacity] = useState<LuggageCapacity>({
        sac: profile?.luggageCapacity?.sac || 5,
        petiteValise: profile?.luggageCapacity?.petiteValise || 3,
        moyenneValise: profile?.luggageCapacity?.moyenneValise || 2,
        grandeValise: profile?.luggageCapacity?.grandeValise || 1
    });

    // Logic
    const handleSaveAll = () => {
        profileService.updateProfile(driverId, {
            privatizationPrices: routePrivatePrices,
            luggageCapacity: luggageCapacity
        });
        alert('Paramètres enregistrés avec succès !');
    };

    const updateLuggageCapacity = (type: keyof LuggageCapacity, delta: number) => {
        setLuggageCapacity(prev => ({
            ...prev,
            [type]: Math.max(0, Math.min(20, prev[type] + delta))
        }));
    };

    const getTotalLuggage = () => luggageCapacity.sac + luggageCapacity.petiteValise + luggageCapacity.moyenneValise + luggageCapacity.grandeValise;

    // TripTemplates Logic
    const handleCreateTemplate = () => {
        const newTemplate: TripTemplate = {
            id: `tpl${Date.now()}`,
            name: formData.name || 'Nouveau modèle',
            origin: formData.origin || 'Tunis',
            destination: formData.destination || 'Sousse',
            departureTime: formData.departureTime || '09:00',
            priceCollective: formData.priceCollective || 8,
            pricePrivate: formData.pricePrivate || 60,
            totalSeats: formData.totalSeats || 8,
            frequency: formData.frequency || 'daily',
            isActive: formData.isActive || true,
            usageCount: 0,
            averageRating: 0,
            revenue: 0
        };
        setTemplates([...templates, newTemplate]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleUpdateTemplate = () => {
        if (!editingTemplate) return;
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t));
        setEditingTemplate(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', origin: 'Tunis', destination: 'Sousse', departureTime: '', priceCollective: 8, pricePrivate: 60, totalSeats: 8, frequency: 'daily', isActive: true });
    };

    // PricingManager Logic
    const calculateKilometricFees = (origin: string, destination: string) => {
        const cityDistances: { [key: string]: { [key: string]: number } } = {
            'Tunis': { 'Sousse': 140, 'Sfax': 270, 'Djerba': 500, 'Monastir': 160, 'Hammamet': 65, 'Nabeul': 65, 'Bizerte': 65 },
            'Sousse': { 'Tunis': 140, 'Sfax': 130, 'Djerba': 360, 'Monastir': 20, 'Hammamet': 75, 'Nabeul': 75, 'Bizerte': 200 }
        };
        const distance = cityDistances[origin]?.[destination] || 100;
        const rate = 0.5;
        return { distance, rate, roundTripFee: distance * rate * 2 };
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-[#2F2E2E] p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-[#D5BDAF] p-3 rounded-2xl">
                            <DollarSign size={28} className="text-[#2F2E2E]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black">Paramètres de Service</h2>
                            <p className="text-[#D5BDAF] font-medium opacity-80">Gérez vos trajets, vos tarifs et vos bagages</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('collective')}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'collective' ? 'bg-[#D5BDAF] text-[#2F2E2E]' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Trajets Collectifs
                        </button>
                        <button
                            onClick={() => setActiveTab('privatization')}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'privatization' ? 'bg-[#D5BDAF] text-[#2F2E2E]' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Tarifs Privatisation
                        </button>
                        <button
                            onClick={() => setActiveTab('luggage')}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'luggage' ? 'bg-[#D5BDAF] text-[#2F2E2E]' : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Capacité Bagages
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#FAF7F2]">
                    {activeTab === 'collective' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-[#2F2E2E]">Modèles de trajets collectifs</h3>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-[#2F2E2E] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#D5BDAF] transition-all"
                                >
                                    <Plus size={18} /> Nouveau modèle
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {templates.map(t => (
                                    <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-[#D5BDAF]/20 flex justify-between items-center group hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#FAF7F2] p-4 rounded-2xl text-[#B08968]"><Route size={24} /></div>
                                            <div>
                                                <div className="font-black text-lg text-[#2F2E2E]">{t.name}</div>
                                                <div className="flex items-center gap-3 text-sm font-bold text-[#7D4F50] opacity-70">
                                                    <MapPin size={14} /> {t.origin} ➔ {t.destination} | <Clock size={14} /> {t.departureTime}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <div className="text-xl font-black text-[#2F2E2E]">{t.priceCollective} TND</div>
                                                <div className="text-[10px] font-black uppercase text-[#7D4F50] opacity-50 tracking-widest">Collectif</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingTemplate(t); setFormData(t); }} className="p-3 bg-[#FAF7F2] text-[#7D4F50] rounded-xl hover:bg-[#D5BDAF] hover:text-white transition-all"><Edit2 size={18} /></button>
                                                <button onClick={() => setTemplates(templates.filter(tpl => tpl.id !== t.id))} className="p-3 bg-[#FAF7F2] text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'privatization' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-[#2F2E2E]">Configuration des tarifs de privatisation</h3>
                                <button
                                    onClick={handleSaveAll}
                                    className="bg-[#2F2E2E] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#D5BDAF] transition-all"
                                >
                                    <Save size={18} /> Enregistrer
                                </button>
                            </div>

                            {/* Editing Existing Route */}
                            {editingRoute && (
                                <div className="bg-white p-8 rounded-[2rem] border border-blue-200 space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h4 className="font-black text-[#2F2E2E] text-lg">Modifier une privatisation</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingRoute(null)}
                                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleSaveEditedRoute}
                                                className="px-4 py-2 rounded-xl bg-[#2F2E2E] text-white font-bold hover:bg-[#B08968] transition-all"
                                            >
                                                Mettre à jour
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Départ</label>
                                            <select
                                                value={editingRoute.origin}
                                                onChange={(e) => updateEditingRouteField('origin', e.target.value)}
                                                className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                            >
                                                {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Destination</label>
                                            <select
                                                value={editingRoute.destination}
                                                onChange={(e) => updateEditingRouteField('destination', e.target.value)}
                                                className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                            >
                                                {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Prix de base (TND)</label>
                                            <input
                                                type="number"
                                                value={editingRoute.basePrice}
                                                onChange={(e) => updateEditingRouteField('basePrice', e.target.value)}
                                                className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add New Route Price */}
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-[#D5BDAF]/30 space-y-6">
                                <h4 className="font-black text-[#7D4F50] text-sm uppercase tracking-widest">Ajouter un tarif par route</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Départ</label>
                                        <select
                                            value={newRoutePrice.origin}
                                            onChange={(e) => setNewRoutePrice({ ...newRoutePrice, origin: e.target.value })}
                                            className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Destination</label>
                                        <select
                                            value={newRoutePrice.destination}
                                            onChange={(e) => setNewRoutePrice({ ...newRoutePrice, destination: e.target.value })}
                                            className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#7D4F50]/60 uppercase ml-1">Prix de Base (TND)</label>
                                        <input
                                            type="number"
                                            value={newRoutePrice.basePrice}
                                            onChange={(e) => setNewRoutePrice({ ...newRoutePrice, basePrice: parseInt(e.target.value) || 0 })}
                                            className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddRoutePrice}
                                    className="w-full py-4 bg-[#B08968] text-white rounded-2xl font-black hover:bg-[#7D4F50] transition-all"
                                >
                                    Ajouter à la liste
                                </button>
                            </div>

                            {/* Prices List */}
                            <div className="grid gap-4">
                                {routePrivatePrices.map(r => (
                                    <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-[#D5BDAF]/20 flex justify-between items-center gap-4 flex-wrap">
                                        <div>
                                            <div className="font-black text-lg text-[#2F2E2E]">{r.origin} ➔ {r.destination}</div>
                                            <div className="text-xs font-bold text-[#7D4F50] opacity-60">Base: {r.basePrice} TND | + 15% Frais Service</div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-xl font-black text-[#B08968]">{Math.round(r.basePrice * 1.15)} TND</div>
                                                <div className="text-[10px] font-black uppercase text-[#7D4F50] opacity-50 tracking-widest">Total Estimé</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditRoute(r)}
                                                    className="p-3 bg-[#FAF7F2] text-[#7D4F50] rounded-xl hover:bg-[#D5BDAF] hover:text-white transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setRoutePrivatePrices(routePrivatePrices.filter(item => item.id !== r.id))}
                                                    className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null /* Removed luggage tab content */}
                </div>

                {/* Create/Edit Template Modal (Nested) */}
                {(showCreateModal || editingTemplate) && (
                    <div className="fixed inset-0 bg-[#2F2E2E]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
                        <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-6 shadow-2xl">
                            <h3 className="text-2xl font-black text-[#2F2E2E]">{editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nom du modèle" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className="p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold">
                                        {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold">
                                        {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="time" value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} className="p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold" />
                                    <input type="number" placeholder="Prix" value={formData.priceCollective} onChange={e => setFormData({ ...formData, priceCollective: parseInt(e.target.value) })} className="p-4 bg-[#FAF7F2] border border-[#D5BDAF]/20 rounded-xl font-bold" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => { setShowCreateModal(false); setEditingTemplate(null); resetForm(); }} className="flex-1 py-4 bg-[#FAF7F2] text-[#7D4F50] rounded-2xl font-black hover:bg-gray-200 transition-all">Annuler</button>
                                <button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="flex-1 py-4 bg-[#2F2E2E] text-white rounded-2xl font-black hover:bg-[#D5BDAF] transition-all">Enregistrer</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingSettings;
