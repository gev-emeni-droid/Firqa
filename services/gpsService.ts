import { GPSLocation, Location } from '../types';

class GPSService {
  private watchId: number | null = null;
  private callbacks: ((location: GPSLocation) => void)[] = [];

  // Simuler la géolocalisation pour la démo
  simulateGPSMovement(driverId: string, interval: number = 5000) {
    const tunisLocations = [
      { lat: 36.8065, lng: 10.1815, address: "Tunis Centre" },
      { lat: 36.8125, lng: 10.1755, address: "Avenue Habib Bourguiba" },
      { lat: 36.8025, lng: 10.1875, address: "Médina de Tunis" },
      { lat: 36.8185, lng: 10.1655, address: "Belvédère" },
      { lat: 36.7955, lng: 10.1955, address: "La Marsa" }
    ];

    let currentIndex = 0;

    const intervalId = setInterval(() => {
      const location = tunisLocations[currentIndex];
      const gpsLocation: GPSLocation = {
        driverId,
        location: {
          ...location,
          timestamp: new Date().toISOString()
        },
        heading: Math.random() * 360,
        speed: Math.random() * 60 + 20 // 20-80 km/h
      };

      this.callbacks.forEach(callback => callback(gpsLocation));
      currentIndex = (currentIndex + 1) % tunisLocations.length;
    }, interval);

    return intervalId;
  }

  startTracking(driverId: string, callback: (location: GPSLocation) => void) {
    this.callbacks.push(callback);
    
    // Utiliser la géolocalisation réelle si disponible
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const gpsLocation: GPSLocation = {
            driverId,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: "Position actuelle",
              timestamp: new Date().toISOString()
            },
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };
          callback(gpsLocation);
        },
        (error) => {
          console.error('GPS Error:', error);
          // Fallback vers simulation
          this.simulateGPSMovement(driverId);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Fallback vers simulation
      return this.simulateGPSMovement(driverId);
    }
  }

  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.callbacks = [];
  }

  // Calcul de distance entre deux points (formule Haversine)
  calculateDistance(loc1: Location, loc2: Location): number {
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

  // Estimer le temps de trajet
  estimateTripDistance(origin: string, destination: string): number {
    // Distances approximatives entre villes tunisiennes (km)
    const distances: { [key: string]: { [key: string]: number } } = {
      'Tunis': { 'Sousse': 140, 'Sfax': 260, 'Monastir': 160, 'Kairouan': 150, 'Bizerte': 65, 'Gabès': 400 },
      'Sousse': { 'Tunis': 140, 'Sfax': 120, 'Monastir': 20, 'Kairouan': 70, 'Bizerte': 200, 'Gabès': 280 },
      'Sfax': { 'Tunis': 260, 'Sousse': 120, 'Monastir': 140, 'Kairouan': 150, 'Bizerte': 320, 'Gabès': 160 },
      'Monastir': { 'Tunis': 160, 'Sousse': 20, 'Sfax': 140, 'Kairouan': 90, 'Bizerte': 220, 'Gabès': 300 },
      'Kairouan': { 'Tunis': 150, 'Sousse': 70, 'Sfax': 150, 'Monastir': 90, 'Bizerte': 210, 'Gabès': 250 },
      'Bizerte': { 'Tunis': 65, 'Sousse': 200, 'Sfax': 320, 'Monastir': 220, 'Kairouan': 210, 'Gabès': 460 },
      'Gabès': { 'Tunis': 400, 'Sousse': 280, 'Sfax': 160, 'Monastir': 300, 'Kairouan': 250, 'Bizerte': 460 }
    };

    return distances[origin]?.[destination] || distances[destination]?.[origin] || 100;
  }

  estimateTravelTime(distanceKm: number, averageSpeedKmh: number = 80): number {
    return Math.round((distanceKm / averageSpeedKmh) * 60); // minutes
  }
}

export const gpsService = new GPSService();
