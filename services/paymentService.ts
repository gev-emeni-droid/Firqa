import type { Payment } from '../types';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  label: string;
  icon: string;
  isDefault: boolean;
}

class PaymentService {
  private payments: Payment[] = [];
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'pm1',
      type: 'cash',
      label: 'Espèces',
      icon: '💵',
      isDefault: true
    },
    {
      id: 'pm2',
      type: 'card',
      label: 'Carte bancaire',
      icon: '💳',
      isDefault: false
    },
    {
      id: 'pm3',
      type: 'wallet',
      label: 'Wallet Firqa',
      icon: '👛',
      isDefault: false
    }
  ];

  private walletBalance: number = 150; // TND

  createPayment(paymentData: Omit<Payment, 'id' | 'timestamp' | 'status'>): Payment {
    const payment: Payment = {
      ...paymentData,
      id: `pay${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.payments.push(payment);
    return payment;
  }

  async processPayment(paymentId: string): Promise<{ success: boolean; message: string }> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      return { success: false, message: 'Paiement non trouvé' };
    }

    // Simuler le traitement du paiement
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (payment.method === 'cash') {
      payment.status = 'completed';
      return { success: true, message: 'Paiement en espèces confirmé' };
    }

    if (payment.method === 'card') {
      // Simuler validation carte (90% de succès)
      const isSuccess = Math.random() > 0.1;
      payment.status = isSuccess ? 'completed' : 'failed';
      return { 
        success: isSuccess, 
        message: isSuccess ? 'Paiement par carte réussi' : 'Paiement refusé par la banque' 
      };
    }

    if (payment.method === 'wallet') {
      if (this.walletBalance >= payment.amount) {
        this.walletBalance -= payment.amount;
        payment.status = 'completed';
        return { success: true, message: `Paiement wallet réussi. Solde: ${this.walletBalance} TND` };
      } else {
        payment.status = 'failed';
        return { success: false, message: 'Solde wallet insuffisant' };
      }
    }

    return { success: false, message: 'Méthode de paiement non supportée' };
  }

  refundPayment(paymentId: string, reason: string): boolean {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'completed') {
      return false;
    }

    payment.status = 'refunded';

    // Rembourser le wallet si applicable
    if (payment.method === 'wallet') {
      this.walletBalance += payment.amount;
    }

    console.log(`Payment ${paymentId} refunded: ${reason}`);
    return true;
  }

  getPaymentHistory(userId: string, userType: 'driver' | 'passenger'): Payment[] {
    return this.payments
      .filter(p => userType === 'driver' ? p.driverId === userId : p.passengerId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getPaymentStats(userId: string, userType: 'driver' | 'passenger', period: 'week' | 'month' | 'year'): {
    totalAmount: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
  } {
    const userPayments = this.getPaymentHistory(userId, userType);
    const now = new Date();
    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 
                     period === 'month' ? 30 * 24 * 60 * 60 * 1000 : 
                     365 * 24 * 60 * 60 * 1000;

    const filteredPayments = userPayments.filter(p => 
      new Date(p.timestamp).getTime() > now.getTime() - periodMs
    );

    return {
      totalAmount: filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      completedPayments: filteredPayments.filter(p => p.status === 'completed').length,
      pendingPayments: filteredPayments.filter(p => p.status === 'pending').length,
      failedPayments: filteredPayments.filter(p => p.status === 'failed').length
    };
  }

  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  addPaymentMethod(method: Omit<PaymentMethod, 'id'>): PaymentMethod {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm${Date.now()}`
    };
    this.paymentMethods.push(newMethod);
    return newMethod;
  }

  setDefaultPaymentMethod(methodId: string): boolean {
    const method = this.paymentMethods.find(m => m.id === methodId);
    if (!method) return false;

    this.paymentMethods.forEach(m => m.isDefault = false);
    method.isDefault = true;
    return true;
  }

  getWalletBalance(): number {
    return this.walletBalance;
  }

  addToWallet(amount: number): boolean {
    if (amount <= 0) return false;
    this.walletBalance += amount;
    return true;
  }

  withdrawFromWallet(amount: number): boolean {
    if (amount <= 0 || this.walletBalance < amount) return false;
    this.walletBalance -= amount;
    return true;
  }

  // Générer un reçu PDF (simulation)
  generateReceipt(paymentId: string): string {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return '';

    return `
      ┌─────────────────────────────────────┐
      │           RECEU FIRQA              │
      ├─────────────────────────────────────┤
      │ ID: ${payment.id}                     │
      │ Date: ${new Date(payment.timestamp).toLocaleDateString('fr-TN')}  │
      │ Montant: ${payment.amount} TND           │
      │ Méthode: ${payment.method}               │
      │ Statut: ${payment.status}                │
      │ Trajet: ${payment.tripId}                │
      ├─────────────────────────────────────┤
      │        Merci d'utiliser Firqa       │
      └─────────────────────────────────────┘
    `;
  }

  // Calcul des frais de plateforme
  calculatePlatformFee(amount: number): number {
    return Math.round(amount * 0.05 * 100) / 100; // 5% de frais
  }

  // Montant net pour le chauffeur
  calculateDriverEarnings(amount: number): number {
    const platformFee = this.calculatePlatformFee(amount);
    return amount - platformFee;
  }
}

export const paymentService = new PaymentService();
