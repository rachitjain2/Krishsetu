export type AppRoute =
  | 'landing'
  | 'role-select'
  | 'farmer-login'
  | 'farmer-register'
  | 'buyer-login'
  | 'buyer-register'
  | 'farmer-dashboard'
  | 'buyer-dashboard';

export type UserRole = 'farmer' | 'buyer' | null;

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  role: 'farmer' | 'buyer';
  location: string;
  specializationOrBusiness?: string;
}

export type FarmerDashboardTab =
  | 'overview'
  | 'dashboard'
  | 'my-crops'
  | 'marketplace'
  | 'orders'
  | 'advisory'
  | 'machinery'
  | 'market-prices'
  | 'profile';

export interface CropListing {
  id: string;
  cropName: string;
  hindiName?: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: string;
  expectedPrice: number;
  location: string;
  distanceKm?: number;
  harvestDate: string;
  qualityGrade: string;
  description: string;
  status: 'Active' | 'Under Offer' | 'Sold';
  imageUrl?: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerRating?: number;
  farmerExperience?: string;
  farmSize?: string;
  moisturePercent?: number;
  mandiBenchmarkPrice?: number;
  inquiriesCount?: number;
  bestOfferPerQuintal?: number;
  clusterLocation?: string;
  certification?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'In Transit'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
  actor: 'Buyer' | 'Farmer' | 'System';
}

export interface Order {
  id: string;
  buyer: {
    name: string;
    phone: string;
    company?: string;
    email?: string;
    location: string;
    deliveryAddress: string;
  };
  farmer: {
    name: string;
    phone: string;
    location: string;
    cluster?: string;
    rating?: number;
  };
  crop: {
    id: string;
    name: string;
    hindiName?: string;
    category: string;
    variety?: string;
    qualityGrade?: string;
    imageUrl?: string;
    moisturePercent?: number;
  };
  quantity: number;
  unit: string;
  price: number;
  totalAmount: number;
  location: {
    pickupLocation: string;
    deliveryAddress: string;
  };
  orderDate: string;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  deliveryDetails?: {
    estimatedDelivery?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    dispatchDate?: string;
    deliveryDate?: string;
  };
  escrowStatus: 'Escrow Protected' | 'Payment Released' | 'Refunded' | 'Pending Deposit';
  notes?: string;
}

export interface FarmerOrder {
  id: string;
  buyerName: string;
  buyerCompany: string;
  buyerLocation: string;
  cropName: string;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  totalAmount: number;
  status: 'In Transit' | 'Pickup Scheduled' | 'Weighing Verified' | 'Completed' | 'Escrow Funded';
  orderDate: string;
  deliveryDate: string;
  vehicleNumber?: string;
  escrowStatus: 'Protected' | 'Released';
}

export interface BuyerOffer {
  id: string;
  buyerName: string;
  company: string;
  cropName: string;
  offeredPrice: number;
  askingPrice: number;
  quantityRequested: number;
  pickupLocation: string;
  paymentTerms: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  receivedTime: string;
}

export type BuyerDashboardTab = 'overview' | 'browse-produce' | 'my-orders' | 'bids' | 'verified-farmers';

export interface AICropAdvisorInput {
  cropName: string;
  location: string;
  landSize: string;
  sowingDate: string;
  expectedHarvestDate: string;
  currentQuantity: string;
  farmerQuestion?: string;
}

export interface NextSeasonSuggestion {
  cropName: string;
  hindiName?: string;
  rationale: string;
  suitabilityScore?: string;
}

export interface AICropAdvisorResult {
  cropSituationSummary: string;
  demandLevel: 'Low' | 'Medium' | 'High';
  sellingRecommendation: 'Sell Now' | 'Hold' | 'Store';
  recommendationReasoning: string;
  nextSeasonSuggestions: NextSeasonSuggestion[];
  importantFactors: string[];
  customQuestionAnswer?: string;
  disclaimer: string;
}

export type MachineType =
  | 'Tractor'
  | 'Harvester'
  | 'Seed Drill'
  | 'Cultivator'
  | 'Rotavator'
  | 'Sprayer';

export interface MachineSpecs {
  hp?: string;
  fuelType?: string;
  capacity?: string;
  workingWidth?: string;
  driveType?: string;
  year?: number;
  includedOperator: boolean;
  fuelIncluded?: boolean;
}

export interface MachineItem {
  id: string;
  name: string;
  hindiName?: string;
  type: MachineType;
  imageUrl: string;
  ownerName: string;
  ownerPhone: string;
  ownerRating: number;
  totalBookings: number;
  location: string;
  distanceKm: number;
  pricePerHour: number;
  rateUnit?: string;
  availability: 'Available Now' | 'Available Today' | 'Booked Today' | 'Available Tomorrow';
  rating: number;
  reviewsCount: number;
  specs: MachineSpecs;
  attachments: string[];
  description: string;
  features: string[];
  termsAndConditions: string[];
}

export type RentalStatus = 'Pending' | 'Accepted' | 'Active' | 'Completed' | 'Cancelled';

export interface RentalStatusHistory {
  status: RentalStatus;
  timestamp: string;
  note: string;
}

export interface RentalRequest {
  id: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  machineImage: string;
  ownerName: string;
  ownerPhone: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  date: string;
  startTime: string;
  durationHours: number;
  pricePerHour: number;
  estimatedCost: number;
  location: string;
  status: RentalStatus;
  requestedAt: string;
  notes?: string;
  statusHistory: RentalStatusHistory[];
}

// MARKET INTELLIGENCE TYPES
export type DemandLevel = 'Very High' | 'High' | 'Moderate' | 'Low';
export type SupplyLevel = 'Surplus' | 'Adequate' | 'Moderate' | 'Constrained' | 'Tight';
export type DateRangeOption = '7d' | '30d' | '3m' | '1y';

export interface PricePoint {
  date: string;
  price: number;
  indicativeMin: number;
  indicativeMax: number;
  volumeQuintals?: number;
}

export interface DemandPoint {
  date: string;
  demandIndex: number; // 0 - 100
  buyerInquiries: number;
  supplyArrivals: number;
}

export interface MarketCropData {
  id: string;
  cropName: string;
  hindiName: string;
  category: string;
  variety: string;
  currentIndicativePrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  unit: string;
  demandLevel: DemandLevel;
  supplyLevel: SupplyLevel;
  location: string;
  mandiName: string;
  state: string;
  dayLow: number;
  dayHigh: number;
  arrivalVolumeQuintals: number;
  tradingVolumeQuintals: number;
  historicalPrices: Record<DateRangeOption, PricePoint[]>;
  demandTrends: Record<DateRangeOption, DemandPoint[]>;
  summaryInsight: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
}

