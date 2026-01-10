import React, { useState } from 'react';
import { X, Settings, Clock, Route, Lock, DollarSign, Star, MapPin, Calendar, Users, Edit2, Save, Trash2, Plus } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { historyService } from '../services/historyService';
import { profileService } from '../services/profileService';

interface NotificationPanelProps {
  userId: string;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Charger toutes les notifications au montage
  React.useEffect(() => {
    setNotifications(notificationService.getUserNotifications(userId));
  }, [userId]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getUserNotifications(userId));
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    setNotifications(notificationService.getUserNotifications(userId));
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    setNotifications(notificationService.getUserNotifications(userId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request': return '📋';
      case 'booking_accepted': return '✅';
      case 'booking_declined': return '❌';
      case 'trip_started': return '🚗';
      case 'trip_completed': return '🏁';
      case 'payment': return '💰';
      case 'emergency': return '🚨';
      default: return '📢';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-TN');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D5BDAF] to-[#B08968] p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">Notifications</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
          
          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full font-bold transition-colors ${
                filter === 'all' ? 'bg-white text-[#7D4F50]' : 'bg-white/20 text-white'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full font-bold transition-colors ${
                filter === 'unread' ? 'bg-white text-[#7D4F50]' : 'bg-white/20 text-white'
              }`}
            >
              Non lues ({notifications.filter(n => !n.read).length})
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={markAllAsRead}
              className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            >
              Marquer tout comme lu
            </button>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>Aucune notification</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{notification.title}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    {notification.actionUrl && (
                      <button className="text-sm text-blue-600 font-bold hover:underline">
                        Voir les détails →
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-200 transition-colors"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
