import { Rating, UserProfile } from '../types';

class RatingService {
  private ratings: Rating[] = [
    {
      id: 'r1',
      tripId: 't1',
      driverId: 'd1',
      passengerId: 'p1',
      rating: 5,
      comment: 'Excellent chauffeur, très ponctuel et courtois',
      timestamp: '2023-10-25T10:30:00Z'
    },
    {
      id: 'r2',
      tripId: 't2',
      driverId: 'd2',
      passengerId: 'p2',
      rating: 4,
      comment: 'Bon trajet, véhicule confortable',
      timestamp: '2023-10-24T14:15:00Z'
    }
  ];

  addRating(rating: Omit<Rating, 'id' | 'timestamp'>): Rating {
    const newRating: Rating = {
      ...rating,
      id: `r${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    this.ratings.push(newRating);
    return newRating;
  }

  getDriverRatings(driverId: string): Rating[] {
    return this.ratings.filter(r => r.driverId === driverId);
  }

  getPassengerRatings(passengerId: string): Rating[] {
    return this.ratings.filter(r => r.passengerId === passengerId);
  }

  calculateAverageRating(entityId: string, type: 'driver' | 'passenger'): number {
    const entityRatings = type === 'driver' 
      ? this.getDriverRatings(entityId)
      : this.getPassengerRatings(entityId);
    
    if (entityRatings.length === 0) return 0;
    
    const sum = entityRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / entityRatings.length) * 10) / 10;
  }

  getRatingDistribution(driverId: string): { [key: number]: number } {
    const ratings = this.getDriverRatings(driverId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    
    return distribution;
  }

  getRecentRatings(driverId: string, limit: number = 10): Rating[] {
    return this.getDriverRatings(driverId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Validation pour éviter les notations abusives
  canRate(tripId: string, userId: string, userType: 'driver' | 'passenger'): boolean {
    const existingRating = this.ratings.find(r => 
      r.tripId === tripId && 
      (userType === 'driver' ? r.driverId === userId : r.passengerId === userId)
    );
    
    return !existingRating;
  }

  // Signaler un avis inapproprié
  reportRating(ratingId: string, reason: string): void {
    console.log(`Rating ${ratingId} reported for: ${reason}`);
    // Dans une vraie application, cela enverrait une notification à l'admin
  }
}

export const ratingService = new RatingService();
