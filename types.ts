
export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
  ADMIN = 'ADMIN'
}

export interface Trip {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  priceCollective: number;
  pricePrivate: number;
  availableSeats: number;
  totalSeats: number;
  isPrivate: boolean;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  recurrenceDays?: string[];
}

export interface BookingRequest {
  id: string;
  tripId: string;
  passengerName: string;
  passengerCount: number;
  luggageCount: number;
  luggageDetails?: {
    sac: number;
    petiteValise: number;
    moyenneValise: number;
    grandeValise: number;
  };
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
  route: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface DriverStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  subscriptionCost: number;
  activeTrips: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
}

export interface GPSLocation {
  driverId: string;
  location: Location;
  heading?: number;
  speed?: number;
}

export interface Rating {
  id: string;
  tripId: string;
  driverId: string;
  passengerId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'trip_started' | 'trip_completed' | 'payment' | 'emergency' | 'favorite_driver' | 'new_trip_available';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface RoutePrivatePrice {
  id: string;
  origin: string;
  destination: string;
  basePrice: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  joinedDate: string;
  stats?: {
    totalTrips?: number;
    totalRevenue?: number;
    averageRating?: number;
    completionRate?: number;
  };
  preferences?: {
    notifications: boolean;
    language: 'fr' | 'ar';
    currency: 'TND';
  };
  luggageCapacity?: {
    sac: number;
    petiteValise: number;
    moyenneValise: number;
    grandeValise: number;
  };
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    ribUrl?: string;
  };
  privatizationPrices?: RoutePrivatePrice[];
}

export interface Payment {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'wallet' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: string;
  driverId: string;
  passengerId: string;
}

export interface EmergencyAlert {
  id: string;
  tripId: string;
  driverId: string;
  passengerId?: string;
  type: 'accident' | 'breakdown' | 'medical' | 'security';
  location: Location;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
}
