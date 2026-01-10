import type { Rating, UserProfile } from '../types';

interface Report {
  id: string;
  type: 'driver' | 'passenger' | 'trip' | 'content';
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  timestamp: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  evidence?: string[];
}

interface ModerationAction {
  id: string;
  userId: string;
  type: 'warning' | 'suspension' | 'ban' | 'verification_required';
  reason: string;
  duration?: number; // days for suspension
  timestamp: string;
  isActive: boolean;
  expiresAt?: string;
}

class ModerationService {
  private reports: Report[] = [
    {
      id: 'r1',
      type: 'driver',
      targetId: 'd2',
      reporterId: 'p1',
      reason: 'conduite dangereuse',
      description: 'Le chauffeur roulait trop vite et utilisait son téléphone',
      status: 'pending',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r2',
      type: 'content',
      targetId: 'review1',
      reporterId: 'd1',
      reason: 'avis faux',
      description: 'Le passager a laissé un avis injustifié',
      status: 'reviewing',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ];

  private moderationActions: ModerationAction[] = [];
  private flaggedContent: Set<string> = new Set();

  // Signaler un utilisateur ou du contenu
  createReport(reportData: Omit<Report, 'id' | 'timestamp' | 'status'>): Report {
    const report: Report = {
      ...reportData,
      id: `report${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.reports.push(report);
    this.notifyModerators(report);
    return report;
  }

  private notifyModerators(report: Report): void {
    console.log(`🚨 New report: ${report.type} - ${report.reason}`);
    console.log(`📝 Description: ${report.description}`);
    // Dans une vraie application, cela enverrait une notification aux admins
  }

  // Récupérer tous les signalements
  getReports(status?: Report['status'], type?: Report['type']): Report[] {
    return this.reports.filter(report => {
      const matchesStatus = !status || report.status === status;
      const matchesType = !type || report.type === type;
      return matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Examiner un signalement
  reviewReport(reportId: string, reviewerId: string, action: 'resolve' | 'dismiss', resolution?: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report || report.status !== 'pending') return false;

    report.status = action === 'resolve' ? 'resolved' : 'dismissed';
    report.reviewedBy = reviewerId;
    report.reviewedAt = new Date().toISOString();
    report.resolution = resolution;

    console.log(`✅ Report ${reportId} ${action} by ${reviewerId}`);
    return true;
  }

  // Actions de modération
  applyModerationAction(actionData: Omit<ModerationAction, 'id' | 'timestamp' | 'isActive'>): ModerationAction {
    const action: ModerationAction = {
      ...actionData,
      id: `action${Date.now()}`,
      timestamp: new Date().toISOString(),
      isActive: true,
      expiresAt: actionData.duration 
        ? new Date(Date.now() + actionData.duration * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };

    this.moderationActions.push(action);
    this.notifyUserAction(action);
    return action;
  }

  private notifyUserAction(action: ModerationAction): void {
    console.log(`⚖️ Moderation action applied to user ${action.userId}: ${action.type}`);
    // Dans une vraie application, cela notifierait l'utilisateur par email/notification
  }

  // Vérifier si un utilisateur est sous modération
  getUserModerationStatus(userId: string): {
    isSuspended: boolean;
    isBanned: boolean;
    hasWarnings: boolean;
    activeActions: ModerationAction[];
  } {
    const userActions = this.moderationActions.filter(action => action.userId === userId);
    const activeActions = userActions.filter(action => action.isActive && 
      (!action.expiresAt || new Date(action.expiresAt) > new Date()));

    return {
      isSuspended: activeActions.some(action => action.type === 'suspension'),
      isBanned: activeActions.some(action => action.type === 'ban'),
      hasWarnings: activeActions.some(action => action.type === 'warning'),
      activeActions
    };
  }

  // Système de détection automatique
  detectSuspiciousActivity(activity: {
    userId: string;
    type: 'rating' | 'booking' | 'payment' | 'message';
    data: any;
  }): { isSuspicious: boolean; reason: string; confidence: number } {
    // Simulation de détection de fraudes
    const { userId, type, data } = activity;

    // Notes anormalement basses ou hautes
    if (type === 'rating' && (data.rating === 1 || data.rating === 5)) {
      const userRatings = this.getUserRecentRatings(userId, 24); // 24 dernières heures
      if (userRatings > 5) {
        return {
          isSuspicious: true,
          reason: 'Activité de notation inhabituelle',
          confidence: 0.7
        };
      }
    }

    // Réservations multiples annulées
    if (type === 'booking' && data.status === 'cancelled') {
      const recentCancellations = this.getUserRecentCancellations(userId, 24);
      if (recentCancellations > 3) {
        return {
          isSuspicious: true,
          reason: 'Taux d\'annulation élevé',
          confidence: 0.8
        };
      }
    }

    // Messages suspects
    if (type === 'message' && this.containsSuspiciousWords(data.content)) {
      return {
        isSuspicious: true,
        reason: 'Contenu suspect détecté',
        confidence: 0.9
      };
    }

    return { isSuspicious: false, reason: '', confidence: 0 };
  }

  private getUserRecentRatings(userId: string, hours: number): number {
    // Simulation - en réalité, cela interrogerait la base de données
    return Math.floor(Math.random() * 10);
  }

  private getUserRecentCancellations(userId: string, hours: number): number {
    // Simulation
    return Math.floor(Math.random() * 5);
  }

  private containsSuspiciousWords(content: string): boolean {
    const suspiciousWords = ['scam', 'fraud', 'arnaque', 'escroquerie', 'paypal', 'bank'];
    return suspiciousWords.some(word => content.toLowerCase().includes(word));
  }

  // Filtrage de contenu
  filterContent(content: string): { isAllowed: boolean; filteredContent: string; reason?: string } {
    // Mots interdits
    const forbiddenWords = ['insulte', 'racisme', 'haine'];
    const foundWords = forbiddenWords.filter(word => content.toLowerCase().includes(word));

    if (foundWords.length > 0) {
      let filteredContent = content;
      foundWords.forEach(word => {
        filteredContent = filteredContent.replace(new RegExp(word, 'gi'), '***');
      });

      return {
        isAllowed: false,
        filteredContent,
        reason: `Contenu inapproprié: ${foundWords.join(', ')}`
      };
    }

    return { isAllowed: true, filteredContent: content };
  }

  // Statistiques de modération
  getModerationStats(): {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    activeActions: number;
    topReportReasons: Array<{ reason: string; count: number }>;
  } {
    const totalReports = this.reports.length;
    const pendingReports = this.reports.filter(r => r.status === 'pending').length;
    const resolvedReports = this.reports.filter(r => r.status === 'resolved').length;
    const activeActions = this.moderationActions.filter(a => a.isActive).length;

    // Raisons les plus fréquentes
    const reasonCounts: { [key: string]: number } = {};
    this.reports.forEach(report => {
      reasonCounts[report.reason] = (reasonCounts[report.reason] || 0) + 1;
    });

    const topReportReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      activeActions,
      topReportReasons
    };
  }

  // Vérification automatique des avis
  async verifyReviewAuthenticity(reviewId: string): Promise<{ isAuthentic: boolean; confidence: number }> {
    // Simulation de vérification d'avis avec IA
    // En réalité, cela utiliserait un modèle ML pour détecter les faux avis
    
    const isAuthentic = Math.random() > 0.1; // 90% authentiques
    const confidence = isAuthentic ? 0.85 : 0.75;

    if (!isAuthentic) {
      this.flaggedContent.add(reviewId);
      console.log(`🚩 Review ${reviewId} flagged as potentially fake`);
    }

    return { isAuthentic, confidence };
  }

  // Export pour conformité
  exportModerationData(): string {
    return JSON.stringify({
      reports: this.reports,
      actions: this.moderationActions,
      flaggedContent: Array.from(this.flaggedContent)
    }, null, 2);
  }
}

export const moderationService = new ModerationService();
