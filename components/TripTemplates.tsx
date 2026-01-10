import React, { useState } from 'react';
import { X, Route, Plus, Edit2, Trash2, Save, Clock, MapPin, Users, DollarSign, Star, TrendingUp } from 'lucide-react';

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

interface TripTemplatesProps {
  driverId: string;
  onClose: () => void;
  onTemplateSelect?: (template: TripTemplate) => void;
}

const TripTemplates: React.FC<TripTemplatesProps> = ({ driverId, onClose, onTemplateSelect }) => {
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
    },
    {
      id: 'tpl3',
      name: 'Tunis → Monastir (Week-end)',
      origin: 'Tunis',
      destination: 'Monastir',
      departureTime: '14:00',
      priceCollective: 12,
      pricePrivate: 80,
      totalSeats: 8,
      frequency: 'weekly',
      isActive: false,
      usageCount: 12,
      averageRating: 4.9,
      revenue: 960
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

    setTemplates(templates.map(t => 
      t.id === editingTemplate.id 
        ? { ...t, ...formData }
        : t
    ));
    setEditingTemplate(null);
    resetForm();
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const resetForm = () => {
    setFormData({
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
  };

  const openEditModal = (template: TripTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'custom': return 'Personnalisé';
      default: return frequency;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Modèles de trajets</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{templates.length}</div>
              <div className="text-xs">Modèles créés</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">{templates.filter(t => t.isActive).length}</div>
              <div className="text-xs">Actifs</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </div>
              <div className="text-xs">Utilisations totales</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-black">
                {formatRevenue(templates.reduce((sum, t) => sum + t.revenue, 0))}
              </div>
              <div className="text-xs">Revenus générés</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Créer un modèle
          </button>
        </div>

        {/* Liste des modèles */}
        <div className="overflow-y-auto max-h-[50vh]">
          {templates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Route size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun modèle de trajet créé</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Créer votre premier modèle →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {templates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          template.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {template.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {getFrequencyLabel(template.frequency)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="text-green-600" size={14} />
                          {template.origin}
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="text-red-600" size={14} />
                          {template.destination}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {template.departureTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {template.totalSeats} places
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-green-600" size={14} />
                          <span className="font-bold">{formatRevenue(template.priceCollective)}</span>
                          <span className="text-gray-500">collectif</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-blue-600" size={14} />
                          <span className="font-bold">{formatRevenue(template.pricePrivate)}</span>
                          <span className="text-gray-500">privé</span>
                        </div>
                        {template.averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            {template.averageRating}/5
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{template.usageCount} utilisations</span>
                        <span>{formatRevenue(template.revenue)} générés</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onTemplateSelect?.(template)}
                        className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        title="Utiliser ce modèle"
                      >
                        <Route size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(template.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          template.isActive 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={template.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {template.isActive ? <X size={16} /> : <Plus size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de création/modification */}
        {(showCreateModal || editingTemplate) && (
          <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <h3 className="text-xl font-black mb-6">
                {editingTemplate ? 'Modifier le modèle' : 'Créer un modèle'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom du modèle</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Tunis → Sousse (Matin)"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Départ</label>
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    >
                      <option value="Tunis">Tunis</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Kairouan">Kairouan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destination</label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    >
                      <option value="Sousse">Sousse</option>
                      <option value="Tunis">Tunis</option>
                      <option value="Sfax">Sfax</option>
                      <option value="Monastir">Monastir</option>
                      <option value="Kairouan">Kairouan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Heure de départ</label>
                    <input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Places</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({...formData, totalSeats: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prix collectif (TND)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.priceCollective}
                      onChange={(e) => setFormData({...formData, priceCollective: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prix privé (TND)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pricePrivate}
                      onChange={(e) => setFormData({...formData, pricePrivate: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fréquence</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value as any})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#D5BDAF] focus:outline-none"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-[#D5BDAF] rounded focus:ring-[#D5BDAF]"
                  />
                  <label className="text-sm font-bold text-gray-700">Modèle actif</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  className="flex-1 bg-[#D5BDAF] text-white py-3 rounded-xl font-bold hover:bg-[#B08968] transition-colors"
                >
                  <Save size={20} className="inline mr-2" />
                  {editingTemplate ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripTemplates;
