import type { Notification } from '../types';

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    // Notifications initiales de démo
    this.notifications = [
      {
        id: 'n1',
        userId: 'd1',
        type: 'booking_request',
        title: 'Nouvelle demande de réservation',
        message: 'Un passager souhaite réserver une place pour Tunis → Sousse',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        actionUrl: '/requests'
      },
      {
        id: 'n2',
        userId: 'p1',
        type: 'booking_accepted',
        title: 'Réservation acceptée',
        message: 'Le chauffeur a accepté votre demande de réservation',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: true
      }
    ];
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.push(callback);
    callback(this.notifications);
  }

  unsubscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift(newNotification);
    this.notifySubscribers();

    // Simuler une notification push
    this.showPushNotification(newNotification);

    return newNotification;
  }

  private showPushNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  markAllAsRead(userId: string): void {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
    this.notifySubscribers();
  }

  getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .filter(n => !unreadOnly || !n.read)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifySubscribers();
  }

  // Notifications prédéfinies pour différents événements
  notifyBookingRequest(driverId: string, passengerName: string, route: string): Notification {
    return this.addNotification({
      userId: driverId,
      type: 'booking_request',
      title: 'Nouvelle demande de réservation',
      message: `${passengerName} souhaite réserver pour ${route}`,
      read: false,
      actionUrl: '/requests'
    });
  }

  notifyBookingAccepted(passengerId: string, driverName: string, route: string): Notification {
    return this.addNotification({
      userId: passengerId,
      type: 'booking_accepted',
      title: 'Réservation acceptée',
      message: `${driverName} a accepté votre réservation pour ${route}`,
      read: false,
      actionUrl: '/my-trips'
    });
  }

  notifyBookingDeclined(passengerId: string, driverName: string, route: string): Notification {
    return this.addNotification({
      userId: passengerId,
      type: 'booking_declined',
      title: 'Réservation refusée',
      message: `${driverName} a refusé votre réservation pour ${route}`,
      read: false
    });
  }

  notifyTripStarted(passengerId: string, driverName: string): Notification {
    return this.addNotification({
      userId: passengerId,
      type: 'trip_started',
      title: 'Le trajet a commencé',
      message: `${driverName} est en route vers votre point de ramassage`,
      read: false,
      actionUrl: '/live-tracking'
    });
  }

  notifyTripCompleted(passengerId: string, driverId: string, route: string): Notification {
    const notification = this.addNotification({
      userId: passengerId,
      type: 'trip_completed',
      title: 'Trajet terminé',
      message: `Votre trajet ${route} est terminé. Notez votre expérience!`,
      read: false,
      actionUrl: '/rate-trip'
    });

    // Notification pour le chauffeur
    this.addNotification({
      userId: driverId,
      type: 'trip_completed',
      title: 'Trajet terminé',
      message: `Le trajet ${route} est terminé. Paiement reçu.`,
      read: false
    });

    return notification;
  }

  notifyPaymentReceived(driverId: string, amount: number, passengerName: string): Notification {
    return this.addNotification({
      userId: driverId,
      type: 'payment',
      title: 'Paiement reçu',
      message: `${amount} TND reçus de ${passengerName}`,
      read: false
    });
  }

  notifyEmergency(emergencyType: string, location: string, userId: string): Notification {
    return this.addNotification({
      userId: 'admin', // Envoyer à tous les admins
      type: 'emergency',
      title: `🚨 Alerte ${emergencyType}`,
      message: `Urgence signalée à ${location}`,
      read: false,
      actionUrl: '/emergency'
    });
  }
}

export const notificationService = new NotificationService();
