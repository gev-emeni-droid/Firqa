
import React from 'react';
import { Users, CreditCard, Activity, AlertCircle, CheckCircle, MoreVertical } from 'lucide-react';

const AdminApp: React.FC = () => {
  const drivers = [
    { id: '1', name: 'Mondher Ben Ali', trips: 145, status: 'approved', revenue: 1200 },
    { id: '2', name: 'Sami Khelifi', trips: 89, status: 'pending', revenue: 650 },
    { id: '3', name: 'Hamza Louati', trips: 12, status: 'suspended', revenue: 45 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black">Tableau de bord Admin</h2>
          <p className="text-gray-500">Supervisez l'écosystème Firqa en temps réel.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border text-sm font-bold flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           Système Opérationnel
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <Users className="text-blue-600 mb-4" />
           <div className="text-2xl font-black">1,245</div>
           <div className="text-sm text-gray-500 font-bold">Chauffeurs actifs</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <Activity className="text-orange-600 mb-4" />
           <div className="text-2xl font-black">8,430</div>
           <div className="text-sm text-gray-500 font-bold">Réservations / mois</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <CreditCard className="text-green-600 mb-4" />
           <div className="text-2xl font-black">15,420 TND</div>
           <div className="text-sm text-gray-500 font-bold">Chiffre d'affaires</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <AlertCircle className="text-red-600 mb-4" />
           <div className="text-2xl font-black">3</div>
           <div className="text-sm text-gray-500 font-bold">Signalements ouverts</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
           <h3 className="font-black text-xl">Gestion des Chauffeurs</h3>
           <div className="flex gap-2">
             <button className="text-sm font-bold px-4 py-2 bg-gray-50 rounded-lg">Filtrer</button>
             <button className="text-sm font-bold px-4 py-2 bg-orange-600 text-white rounded-lg">Exporter</button>
           </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 text-left">Chauffeur</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Courses</th>
              <th className="px-6 py-4 text-left">Revenu Généré</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {drivers.map(driver => (
              <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{driver.name[0]}</div>
                    <div className="font-bold">{driver.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    driver.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    driver.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-600">{driver.trips}</td>
                <td className="px-6 py-4 font-black">{driver.revenue} TND</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-900"><MoreVertical size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApp;
