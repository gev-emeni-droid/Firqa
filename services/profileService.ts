import type { UserProfile } from '../types';
import { UserRole } from '../types';

interface LuggageCapacity {
  sac: number;
  petiteValise: number;
  moyenneValise: number;
  grandeValise: number;
}

class ProfileService {
  private profiles: UserProfile[] = [
    {
      id: 'd1',
      name: 'Mondher Ben Ali',
      email: 'mondher.benali@email.com',
      phone: '+216 23 456 789',
      role: UserRole.DRIVER,
      avatar: '👨‍✈️',
      isVerified: true,
      joinedDate: '2023-01-15',
      stats: {
        totalTrips: 145,
        totalRevenue: 1200,
        averageRating: 4.8,
        completionRate: 95
      },
      preferences: {
        notifications: true,
        language: 'fr',
        currency: 'TND'
      },
      luggageCapacity: {
        sac: 5,
        petiteValise: 3,
        moyenneValise: 2,
        grandeValise: 1
      },
      bankDetails: {
        bankName: 'BIAT',
        accountHolder: 'Mondher Ben Ali',
        iban: 'TN59 0800 1000 1234 5678 9012',
        ribUrl: 'https://example.com/rib.pdf'
      },
      privatizationPrices: [
        { id: '1', origin: 'Tunis', destination: 'Sousse', basePrice: 75 },
        { id: '2', origin: 'Tunis', destination: 'Sfax', basePrice: 120 },
        { id: '3', origin: 'Tunis', destination: 'Djerba', basePrice: 200 },
        { id: '4', origin: 'Sousse', destination: 'Sfax', basePrice: 60 }
      ]
    },
    {
      id: 'p1',
      name: 'Sarra Jlassi',
      email: 'sarra.jlassi@email.com',
      phone: '+216 98 765 432',
      role: UserRole.PASSENGER,
      avatar: '👩',
      isVerified: true,
      joinedDate: '2023-03-20',
      stats: {
        totalTrips: 23,
        averageRating: 4.6
      },
      preferences: {
        notifications: true,
        language: 'fr',
        currency: 'TND'
      }
    }
  ];

  getProfile(userId: string): UserProfile | null {
    return this.profiles.find(p => p.id === userId) || null;
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): boolean {
    const profileIndex = this.profiles.findIndex(p => p.id === userId);
    if (profileIndex === -1) return false;

    this.profiles[profileIndex] = { ...this.profiles[profileIndex], ...updates };
    return true;
  }

  createProfile(profileData: Omit<UserProfile, 'id' | 'joinedDate'>): UserProfile {
    const newProfile: UserProfile = {
      ...profileData,
      id: `user${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      stats: profileData.stats || {}
    };

    this.profiles.push(newProfile);
    return newProfile;
  }

  verifyProfile(userId: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    profile.isVerified = true;
    console.log(`✅ Profile ${userId} verified`);
    return true;
  }

  updateStats(userId: string, statsUpdate: Partial<UserProfile['stats']>): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    profile.stats = { ...profile.stats, ...statsUpdate };
    return true;
  }

  updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    profile.preferences = { ...profile.preferences, ...preferences };
    return true;
  }

  searchProfiles(query: string, role?: UserRole): UserProfile[] {
    return this.profiles.filter(profile => {
      const matchesRole = !role || profile.role === role;
      const matchesQuery = !query ||
        profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.email.toLowerCase().includes(query.toLowerCase());

      return matchesRole && matchesQuery;
    });
  }

  getDriversByRating(minRating: number = 4): UserProfile[] {
    return this.profiles
      .filter(p => p.role === UserRole.DRIVER && (p.stats?.averageRating || 0) >= minRating)
      .sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0));
  }

  getTopDrivers(limit: number = 10): UserProfile[] {
    return this.profiles
      .filter(p => p.role === UserRole.DRIVER)
      .sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0))
      .slice(0, limit);
  }

  // Validation des documents
  uploadDocument(userId: string, documentType: 'id' | 'license' | 'vehicle' | 'insurance', documentUrl: string): boolean {
    const profile = this.getProfile(userId);
    if (!profile) return false;

    console.log(`📄 Document uploaded for user ${userId}: ${documentType}`);
    console.log(`📎 Document URL: ${documentUrl}`);

    // Dans une vraie application, cela stockerait le document et lancerait la vérification
    return true;
  }

  // Vérifier si le profil est complet
  isProfileComplete(userId: string): { isComplete: boolean; missingFields: string[] } {
    const profile = this.getProfile(userId);
    if (!profile) return { isComplete: false, missingFields: ['profile_not_found'] };

    const requiredFields = ['name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);

    // Champs supplémentaires pour les chauffeurs
    if (profile.role === UserRole.DRIVER) {
      const driverFields = ['avatar'];
      missingFields.push(...driverFields.filter(field => !profile[field as keyof UserProfile]));
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  }

  // Calcul du niveau de confiance
  calculateTrustScore(userId: string): number {
    const profile = this.getProfile(userId);
    if (!profile) return 0;

    let score = 0;

    // Vérification du profil (20 points)
    if (profile.isVerified) score += 20;

    // Ancienneté (max 30 points)
    const joinDate = new Date(profile.joinedDate);
    const daysSinceJoined = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    score += Math.min(daysSinceJoined / 365 * 30, 30);

    // Statistiques (max 50 points)
    if (profile.stats) {
      // Rating (25 points)
      score += (profile.stats.averageRating || 0) * 5;

      // Nombre de trajets (15 points)
      score += Math.min((profile.stats.totalTrips || 0) / 10, 15);

      // Taux de complétion (10 points)
      score += (profile.stats.completionRate || 0) / 10;
    }

    return Math.round(score);
  }

  // Générer un rapport d'activité
  generateActivityReport(userId: string, period: 'week' | 'month' | 'year'): {
    period: string;
    stats: UserProfile['stats'];
    trustScore: number;
    recommendations: string[];
  } {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    const trustScore = this.calculateTrustScore(userId);
    const recommendations: string[] = [];

    // Recommandations basées sur les stats
    if (profile.stats) {
      if ((profile.stats.averageRating || 0) < 4.5) {
        recommendations.push('Améliorez votre service pour augmenter votre note');
      }
      if ((profile.stats.completionRate || 0) < 90) {
        recommendations.push('Assurez-vous de compléter tous vos trajets acceptés');
      }
      if (profile.role === UserRole.DRIVER && (profile.stats.totalTrips || 0) < 50) {
        recommendations.push('Augmentez votre nombre de trajets pour plus de visibilité');
      }
    }

    return {
      period,
      stats: profile.stats || {},
      trustScore,
      recommendations
    };
  }

  // Exporter les données du profil (RGPD)
  exportProfileData(userId: string): string {
    const profile = this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    return JSON.stringify(profile, null, 2);
  }

  // Supprimer le profil (RGPD)
  deleteProfile(userId: string): boolean {
    const profileIndex = this.profiles.findIndex(p => p.id === userId);
    if (profileIndex === -1) return false;

    this.profiles.splice(profileIndex, 1);
    console.log(`🗑️ Profile ${userId} deleted (GDPR request)`);
    return true;
  }
}

export const profileService = new ProfileService();
