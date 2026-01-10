import type { EmergencyAlert, Location } from '../types';

class EmergencyService {
  private alerts: EmergencyAlert[] = [];
  private emergencyContacts = [
    { name: 'Police', phone: '197', type: 'police' },
    { name: 'Protection Civile', phone: '198', type: 'medical' },
    { name: 'Garde Nationale', phone: '193', type: 'security' },
    { name: 'Assistance Firqa', phone: '70123456', type: 'support' }
  ];

  createAlert(alertData: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>): EmergencyAlert {
    const alert: EmergencyAlert = {
      ...alertData,
      id: `alert${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    this.alerts.push(alert);
    this.notifyEmergencyServices(alert);
    return alert;
  }

  private notifyEmergencyServices(alert: EmergencyAlert): void {
    console.log(`🚨 EMERGENCY ALERT: ${alert.type.toUpperCase()}`);
    console.log(`Location: ${alert.location.address}`);
    console.log(`Driver: ${alert.driverId}`);
    console.log(`Description: ${alert.description}`);
    
    // Dans une vraie application, cela enverrait des notifications:
    // - Aux services d'urgence appropriés
    // - À l'équipe d'assistance Firqa
    // - Aux contacts d'urgence du chauffeur
  }

  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status !== 'active') return false;

    alert.status = 'resolved';
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date().toISOString();

    console.log(`✅ Emergency alert ${alertId} resolved by ${resolvedBy}`);
    return true;
  }

  getActiveAlerts(): EmergencyAlert[] {
    return this.alerts.filter(a => a.status === 'active');
  }

  getAlertHistory(driverId?: string): EmergencyAlert[] {
    return this.alerts
      .filter(a => !driverId || a.driverId === driverId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getEmergencyContacts() {
    return this.emergencyContacts;
  }

  // Types d'urgences avec descriptions
  getEmergencyTypes() {
    return [
      {
        type: 'accident',
        label: 'Accident',
        description: 'Collision ou accident de la route',
        icon: '🚗',
        priority: 'high'
      },
      {
        type: 'breakdown',
        label: 'Panne mécanique',
        description: 'Problème technique du véhicule',
        icon: '🔧',
        priority: 'medium'
      },
      {
        type: 'medical',
        label: 'Urgence médicale',
        description: 'Problème de santé passager ou chauffeur',
        icon: '🚑',
        priority: 'high'
      },
      {
        type: 'security',
        label: 'Problème de sécurité',
        description: 'Situation dangereuse ou agression',
        icon: '🚨',
        priority: 'critical'
      }
    ];
  }

  // Envoyer la position actuelle aux services d'urgence
  shareLocationWithServices(location: Location, alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return;

    console.log(`📍 Sharing location for emergency ${alertId}:`);
    console.log(`GPS: ${location.lat}, ${location.lng}`);
    console.log(`Address: ${location.address}`);
    
    // Dans une vraie application, cela partagerait la position via:
    // - API des services d'urgence
    // - SMS aux contacts d'urgence
    // - Notification push à l'équipe Firqa
  }

  // Calculer le temps d'intervention estimé
  estimateInterventionTime(location: Location): number {
    // Simulation basée sur la distance par rapport aux centres d'urgence
    // En réalité, cela utiliserait une API de cartographie
    const tunisCenter = { lat: 36.8065, lng: 10.1815 };
    const distance = this.calculateDistance(location, tunisCenter);
    
    // Temps moyen d'intervention: 5-15 minutes en ville
    return Math.min(Math.max(Math.round(distance * 2), 5), 15);
  }

  private calculateDistance(loc1: Location, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lng - loc1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Vérifier si un trajet est dans une zone à risque
  checkRiskZone(origin: string, destination: string): { isRisky: boolean; riskLevel: 'low' | 'medium' | 'high'; advice: string } {
    // Simulation de zones à risque (basé sur les données réelles)
    const riskZones = {
      'high': ['Kairouan', 'Gafsa'],
      'medium': ['Sfax', 'Gabès'],
      'low': ['Tunis', 'Sousse', 'Monastir', 'Bizerte', 'Ariana', 'La Marsa', 'Hammamet', 'Djerba']
    };

    const checkCityRisk = (city: string) => {
      for (const [level, cities] of Object.entries(riskZones)) {
        if (cities.includes(city)) return level as 'low' | 'medium' | 'high';
      }
      return 'low';
    };

    const originRisk = checkCityRisk(origin);
    const destRisk = checkCityRisk(destination);
    
    const highestRisk = originRisk === 'high' || destRisk === 'high' ? 'high' :
                       originRisk === 'medium' || destRisk === 'medium' ? 'medium' : 'low';

    const advice = highestRisk === 'high' ? 'Évitez de voyager la nuit, restez sur les axes principaux' :
                   highestRisk === 'medium' ? 'Soyez vigilant et informez quelqu\'un de votre itinéraire' :
                   'Trajet sécurisé';

    return {
      isRisky: highestRisk !== 'low',
      riskLevel: highestRisk,
      advice
    };
  }

  // Protocole d'urgence automatique
  async triggerEmergencyProtocol(driverId: string, alertType: string, location: Location, description: string): Promise<void> {
    // 1. Créer l'alerte
    const alert = this.createAlert({
      tripId: 'current', // Sera remplacé par l'ID du trajet actuel
      driverId,
      type: alertType as any,
      location,
      description
    });

    // 2. Partager la position
    this.shareLocationWithServices(location, alert.id);

    // 3. Estimer le temps d'intervention
    const interventionTime = this.estimateInterventionTime(location);

    // 4. Notifier les contacts d'urgence (simulation)
    console.log(`📞 Notifying emergency contacts...`);
    console.log(`⏱️ Estimated intervention time: ${interventionTime} minutes`);

    // 5. Démarrer l'enregistrement audio (simulation)
    console.log(`🎤 Starting audio recording for evidence...`);

    // 6. Activer le mode suivi continu
    console.log(`📍 Activating continuous location tracking...`);
  }
}

export const emergencyService = new EmergencyService();
