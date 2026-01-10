import type { Trip, BookingRequest, Rating, Payment, UserProfile } from '../types';

interface TripHistory {
  trip: Trip;
  bookingRequest: BookingRequest;
  rating?: Rating;
  payment?: Payment;
  driverProfile?: UserProfile;
  passengerProfile?: UserProfile;
}

class HistoryService {
  private tripHistory: TripHistory[] = [];

  addTripToHistory(
    trip: Trip, 
    bookingRequest: BookingRequest, 
    rating?: Rating, 
    payment?: Payment,
    driverProfile?: UserProfile,
    passengerProfile?: UserProfile
  ): void {
    const historyEntry: TripHistory = {
      trip,
      bookingRequest,
      rating,
      payment,
      driverProfile,
      passengerProfile
    };

    this.tripHistory.push(historyEntry);
  }

  getUserTripHistory(userId: string, userType: 'driver' | 'passenger'): TripHistory[] {
    return this.tripHistory
      .filter(entry => 
        userType === 'driver' 
          ? entry.trip.driverId === userId
          : entry.bookingRequest.passengerName === 'Moi' // Simplifié pour la démo
      )
      .sort((a, b) => new Date(b.trip.id).getTime() - new Date(a.trip.id).getTime());
  }

  getTripAnalytics(userId: string, userType: 'driver' | 'passenger', period: 'week' | 'month' | 'year'): {
    totalTrips: number;
    totalRevenue: number;
    totalSpent: number;
    averageRating: number;
    completionRate: number;
    popularRoutes: Array<{ route: string; count: number }>;
    monthlyTrend: Array<{ month: string; trips: number; revenue: number }>;
  } {
    const history = this.getUserTripHistory(userId, userType);
    const now = new Date();
    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 
                     period === 'month' ? 30 * 24 * 60 * 60 * 1000 : 
                     365 * 24 * 60 * 60 * 1000;

    const filteredHistory = history.filter(entry => {
      const tripDate = new Date(entry.trip.id); // Simplifié - utiliser une vraie date
      return tripDate.getTime() > now.getTime() - periodMs;
    });

    const completedTrips = filteredHistory.filter(entry => entry.trip.status === 'completed');
    const totalRevenue = userType === 'driver' 
      ? completedTrips.reduce((sum, entry) => sum + (entry.payment?.amount || 0), 0)
      : 0;
    const totalSpent = userType === 'passenger'
      ? completedTrips.reduce((sum, entry) => sum + (entry.payment?.amount || 0), 0)
      : 0;

    const ratings = completedTrips
      .map(entry => entry.rating?.rating)
      .filter(rating => rating !== undefined) as number[];
    const averageRating = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : 0;

    const completionRate = filteredHistory.length > 0 
      ? Math.round((completedTrips.length / filteredHistory.length) * 100)
      : 0;

    // Routes populaires
    const routeCounts: { [key: string]: number } = {};
    completedTrips.forEach(entry => {
      const route = `${entry.trip.origin} → ${entry.trip.destination}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const popularRoutes = Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tendance mensuelle
    const monthlyData: { [key: string]: { trips: number; revenue: number } } = {};
    completedTrips.forEach(entry => {
      const month = new Date().toLocaleDateString('fr-TN', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { trips: 0, revenue: 0 };
      }
      monthlyData[month].trips++;
      monthlyData[month].revenue += entry.payment?.amount || 0;
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, trips: data.trips, revenue: data.revenue }))
      .slice(-6); // 6 derniers mois

    return {
      totalTrips: completedTrips.length,
      totalRevenue,
      totalSpent,
      averageRating,
      completionRate,
      popularRoutes,
      monthlyTrend
    };
  }

  getRouteStatistics(origin: string, destination: string): {
    totalTrips: number;
    averagePrice: number;
    averageDuration: number;
    popularTimes: Array<{ hour: number; count: number }>;
    driverCount: number;
  } {
    const routeTrips = this.tripHistory.filter(entry => 
      entry.trip.origin === origin && entry.trip.destination === destination
    );

    const completedRouteTrips = routeTrips.filter(entry => entry.trip.status === 'completed');
    
    const averagePrice = completedRouteTrips.length > 0
      ? Math.round((completedRouteTrips.reduce((sum, entry) => 
          sum + (entry.trip.isPrivate ? entry.trip.pricePrivate : entry.trip.priceCollective), 0
        ) / completedRouteTrips.length) * 100) / 100
      : 0;

    // Heures populaires
    const hourCounts: { [key: number]: number } = {};
    completedRouteTrips.forEach(entry => {
      const hour = parseInt(entry.trip.departureTime.split(':')[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const popularTimes = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Nombre de chauffeurs uniques
    const uniqueDrivers = new Set(routeTrips.map(entry => entry.trip.driverId));

    return {
      totalTrips: completedRouteTrips.length,
      averagePrice,
      averageDuration: 120, // minutes (simulation)
      popularTimes,
      driverCount: uniqueDrivers.size
    };
  }

  getPerformanceMetrics(userId: string, userType: 'driver' | 'passenger'): {
    onTimeRate: number;
    cancellationRate: number;
    responseTime: number;
    customerSatisfaction: number;
    efficiency: number;
  } {
    const history = this.getUserTripHistory(userId, userType);
    const completedTrips = history.filter(entry => entry.trip.status === 'completed');
    const cancelledTrips = history.filter(entry => entry.trip.status === 'cancelled');

    // Taux de ponctualité (simulation)
    const onTimeRate = completedTrips.length > 0 
      ? Math.round((completedTrips.filter(() => Math.random() > 0.1).length / completedTrips.length) * 100)
      : 0;

    // Taux d'annulation
    const cancellationRate = history.length > 0 
      ? Math.round((cancelledTrips.length / history.length) * 100)
      : 0;

    // Temps de réponse moyen (minutes)
    const responseTime = userType === 'driver' ? 5 : 3; // Simulation

    // Satisfaction client
    const ratings = completedTrips
      .map(entry => entry.rating?.rating)
      .filter(rating => rating !== undefined) as number[];
    const customerSatisfaction = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 20)
      : 0;

    // Efficacité globale
    const efficiency = Math.round((onTimeRate * 0.3 + (100 - cancellationRate) * 0.3 + customerSatisfaction * 0.4));

    return {
      onTimeRate,
      cancellationRate,
      responseTime,
      customerSatisfaction,
      efficiency
    };
  }

  exportHistory(userId: string, userType: 'driver' | 'passenger', format: 'json' | 'csv' | 'pdf'): string {
    const history = this.getUserTripHistory(userId, userType);

    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }

    if (format === 'csv') {
      const headers = 'Date,Trajet,Prix,Statut,Note,Passager,Chauffeur\n';
      const rows = history.map(entry => {
        const date = new Date().toLocaleDateString('fr-TN'); // Simplifié
        const route = `${entry.trip.origin} → ${entry.trip.destination}`;
        const price = entry.trip.isPrivate ? entry.trip.pricePrivate : entry.trip.priceCollective;
        const status = entry.trip.status;
        const rating = entry.rating?.rating || '';
        const passenger = entry.bookingRequest.passengerName;
        const driver = entry.driverProfile?.name || 'N/A';
        
        return `${date},"${route}",${price},${status},${rating},"${passenger}","${driver}"}`;
      }).join('\n');

      return headers + rows;
    }

    // PDF (simplifié - retourne JSON pour la démo)
    return JSON.stringify(history, null, 2);
  }

  // Prédictions basées sur l'historique
  predictNextMonthRevenue(userId: string, userType: 'driver'): {
    predictedRevenue: number;
    confidence: number;
    factors: string[];
  } {
    if (userType !== 'driver') {
      return { predictedRevenue: 0, confidence: 0, factors: [] };
    }

    const analytics = this.getTripAnalytics(userId, userType, 'month');
    const lastMonthRevenue = analytics.totalRevenue;

    // Facteurs influençant les prédictions
    const factors: string[] = [];
    let multiplier = 1.0;

    // Saison (plus de voyages en été)
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) { // Juin à Septembre
      multiplier += 0.2;
      factors.push('Saison estivale (+20%)');
    }

    // Tendance de croissance
    if (analytics.monthlyTrend.length >= 2) {
      const lastTwoMonths = analytics.monthlyTrend.slice(-2);
      const growth = (lastTwoMonths[1].revenue - lastTwoMonths[0].revenue) / lastTwoMonths[0].revenue;
      if (growth > 0) {
        multiplier += growth * 0.5;
        factors.push(`Tendance croissance (+${Math.round(growth * 50)}%)`);
      }
    }

    // Taux de complétion élevé
    if (analytics.completionRate > 95) {
      multiplier += 0.1;
      factors.push('Excellent taux de complétion (+10%)');
    }

    const predictedRevenue = Math.round(lastMonthRevenue * multiplier);
    const confidence = Math.min(Math.round(analytics.completionRate), 95);

    return {
      predictedRevenue,
      confidence,
      factors
    };
  }

  getInsights(userId: string, userType: 'driver' | 'passenger'): Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }> {
    const analytics = this.getTripAnalytics(userId, userType, 'month');
    const metrics = this.getPerformanceMetrics(userId, userType);
    const insights: any[] = [];

    if (userType === 'driver') {
      if (metrics.efficiency > 85) {
        insights.push({
          type: 'success',
          title: 'Performance excellente',
          description: `Votre efficacité de ${metrics.efficiency}% place parmi les meilleurs chauffeurs`,
          action: 'Maintenez ce niveau de qualité'
        });
      }

      if (metrics.cancellationRate > 15) {
        insights.push({
          type: 'warning',
          title: 'Taux d\'annulation élevé',
          description: `${metrics.cancellationRate}% de vos trajets sont annulés`,
          action: 'Vérifiez votre disponibilité avant d\'accepter'
        });
      }

      if (analytics.averageRating < 4.5) {
        insights.push({
          type: 'info',
          title: 'Amélioration possible',
          description: 'Votre note pourrait être améliorée pour plus de visibilité',
          action: 'Focus sur la ponctualité et le service client'
        });
      }
    }

    return insights;
  }
}

export const historyService = new HistoryService();
