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
  uid?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'farmer' | 'buyer';
  location: string;
  specializationOrBusiness?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FarmerDashboardTab =
  | 'overview'
  | 'dashboard'
  | 'batch-quality-score'
  | 'suggested-bundles'
  | 'group-bundling'
  | 'reverse-auction'
  | 'live-gps-machinery'
  | 'micro-credit'
  | 'my-crops'
  | 'marketplace'
  | 'orders'
  | 'advisory'
  | 'machinery'
  | 'market-prices'
  | 'profile';

// QUALITY-VERIFIED BATCH SCORE DATA MODELS
export interface ScoreBreakdown {
  freshness: number;
  reliability: number;
  peer_rating: number;
  image_quality: number;
  freshness_explanation: string;
  reliability_explanation: string;
  peer_rating_explanation: string;
  image_quality_explanation: string;
}

export interface QualityScore {
  listing_id: string;
  farmer_id: string;
  crop_name?: string;
  freshness_score: number;
  farmer_reliability_score: number;
  peer_rating_score: number;
  image_quality_score: number;
  final_score: number;
  letter_grade: 'A' | 'B' | 'C' | 'D';
  score_breakdown: ScoreBreakdown;
  updated_at?: string;
}

export interface CropListing {
  id: string;
  farmerUid?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  buyerUid?: string;
  farmerUid?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  ownerUid?: string;
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
  createdAt?: string;
}

export type RentalStatus = 'Pending' | 'Accepted' | 'Active' | 'Completed' | 'Cancelled';

export interface RentalStatusHistory {
  status: RentalStatus;
  timestamp: string;
  note: string;
}

export interface RentalRequest {
  id: string;
  farmerUid?: string;
  ownerUid?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface AIRecommendationRecord {
  id: string;
  userUid: string;
  farmerName: string;
  cropName: string;
  location: string;
  inputData: AICropAdvisorInput;
  result: AICropAdvisorResult;
  createdAt: string;
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

// ==========================================
// 1. REVERSE-AUCTION MARKETPLACE TYPES
// ==========================================
export interface LiveAuctionBid {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderCompany: string;
  bidderLocation: string;
  bidderRating: number;
  bidAmountPerUnit: number; // In INR per quintal
  totalLotAmount: number;
  timestamp: string;
  isAutoBid?: boolean;
  status: 'active' | 'outbid' | 'winning' | 'accepted';
}

export interface ReverseAuctionLot {
  id: string;
  cropId: string;
  farmerUid: string;
  farmerName: string;
  farmerPhone: string;
  farmerRating: number;
  farmerLocation: string;
  cluster: string;
  cropName: string;
  hindiName: string;
  category: string;
  variety: string;
  quantity: number;
  unit: string; // Quintals, MT
  floorPrice: number; // Minimum reserve price per quintal in INR
  currentHighestBid: number;
  totalBidsCount: number;
  leadingBidderName?: string;
  leadingBidderCompany?: string;
  qualityGrade: string;
  moisturePercent: number;
  mandiBenchmarkPrice: number; // Local APMC price for comparative analysis
  middlemanMandiNetPrice: number; // What farmer gets after middleman cuts
  status: 'live' | 'ending_soon' | 'completed' | 'paused';
  startTime: string;
  endTime: string;
  remainingSeconds: number;
  bidsHistory: LiveAuctionBid[];
  imageUrl: string;
  deliveryTerms: string;
  escrowStatus: 'Pending Bids' | 'Locked & Funded' | 'Released';
  sampleCertified: boolean;
  notes: string;
}

// ==========================================
// 2. SATELLITE & NDVI YIELD PREDICTION TYPES
// ==========================================
export interface MultispectralBands {
  b2Blue: number; // 490 nm
  b3Green: number; // 560 nm
  b4Red: number; // 665 nm (Chlorophyll absorption)
  b8NIR: number; // 842 nm (Near-Infrared cell reflectance)
  b11SWIR: number; // 1610 nm (Canopy moisture content)
}

export interface NDVITimePoint {
  date: string;
  week: number;
  ndvi: number; // -1 to 1 (Healthy crops: 0.55 - 0.88)
  evi: number; // Enhanced Veg Index
  savi: number; // Soil Adjusted Veg Index
  canopyMoisture: number; // %
  rainfallMm: number;
  gddThermalUnits: number; // Growing Degree Days
}

export interface FieldPlotGeometry {
  plotId: string;
  plotName: string;
  farmerName: string;
  latitude: number;
  longitude: number;
  areaAcres: number;
  soilType: string;
  soilOrganicCarbon: number; // %
  nitrogenIndex: string; // Low, Medium, Optimal
  irrigationSource: string;
  currentCrop: string;
  sowingDate: string;
  expectedHarvestDate: string;
  clusterLocation: string;
  boundaryCoordinates: Array<{ lat: number; lng: number }>;
}

export interface YieldRegressionResult {
  predictedYieldPerAcre: number; // Quintals / Acre
  confidenceMarginQuintals: number; // e.g. ±1.2 Qtl
  totalPredictedHarvest: number; // Total Quintals across acreage
  predictedHarvestWindow: string;
  baselineHistoricalAvg: number;
  yieldDeltaPercent: number; // e.g. +14.2% vs district historical avg
  modelFactors: {
    satelliteNDVIWeight: number; // 40%
    thermalGDDWeight: number; // 25%
    soilCarbonFactor: number; // 20%
    precipitationTrend: number; // 15%
  };
  cropHealthStatus: 'Vigorous / Optimal' | 'Moderate / Healthy' | 'Moisture Stress' | 'Nutrient Deficient';
  spectralBands: MultispectralBands;
  ndviTrend: NDVITimePoint[];
  estimatedGrossRevenueMin: number;
  estimatedGrossRevenueMax: number;
  actionableAdvisory: string[];
}

// ==========================================
// 3. LIVE GPS MACHINERY & ESCROW TYPES
// ==========================================
export interface GPSLocation {
  lat: number;
  lng: number;
  heading: number; // 0 - 360 deg
  speedKmh: number;
  lastUpdated: string;
}

export interface LiveGPSMachine {
  id: string;
  name: string;
  hindiName: string;
  type: MachineType;
  ownerName: string;
  ownerPhone: string;
  operatorName: string;
  rating: number;
  totalTrips: number;
  hourlyRate: number;
  acreRate?: number;
  currentGps: GPSLocation;
  status: 'available_moving' | 'idle_ready' | 'en_route' | 'working_in_field' | 'maintenance';
  fuelLevelPercent: number;
  equipmentHp: string;
  implementsAttached: string[];
  batteryTelemetry: number;
  imageUrl: string;
  currentDistanceKm: number;
  etaMinutes: number;
}

export interface MachineryEscrowBooking {
  bookingId: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  farmerName: string;
  farmerPhone: string;
  farmerPlotCoords: { lat: number; lng: number };
  ownerName: string;
  ownerPhone: string;
  workDate: string;
  bookedHours: number;
  acresTargeted: number;
  hourlyRate: number;
  totalEscrowAmount: number;
  escrowStatus: 'HELD_IN_ESCROW' | 'WORK_IN_PROGRESS' | 'FIELD_VERIFIED' | 'RELEASED_TO_OWNER';
  otpStart: string;
  otpEnd: string;
  workTimeline: Array<{ step: string; timestamp: string; note: string; completed: boolean }>;
  gpsFieldCoverageAcres: number;
  telemetryLogs: Array<{ time: string; speed: number; engineRpm: number; acresTilled: number }>;
}

// ==========================================
// 4. AGRI-FINTECH MICRO-CREDIT TYPES
// ==========================================
export interface CreditPillarScore {
  name: string;
  hindiName: string;
  score: number; // 0 - 100
  weight: number; // %
  status: 'Excellent' | 'Good' | 'Average' | 'Building';
  metrics: string[];
  keyInsight: string;
}

export interface KisanMicroCreditProfile {
  farmerUid: string;
  farmerName: string;
  farmerPhone: string;
  landHoldingAcres: number;
  overallScore: number; // 300 to 900
  scoreTier: 'AAA (Prime Farmer)' | 'AA (High Trust)' | 'A (Eligible)' | 'B (Building History)';
  percentileRanking: number; // e.g. Top 8% of regional farmers
  pillars: {
    machineryDiscipline: CreditPillarScore; // 30%
    auctionFulfillment: CreditPillarScore; // 25%
    satelliteYieldConsistency: CreditPillarScore; // 20%
    escrowTransactionVolume: CreditPillarScore; // 15%
    soilAndLandTenure: CreditPillarScore; // 10%
  };
  totalEscrowVolumeProcessed: number;
  onTimeSettlementRate: number; // e.g. 98.4%
  completedAuctionsCount: number;
  disputeFreeTrips: number;
  preApprovedLoanAmount: number; // e.g. ₹85,000
  interestRatePerAnnum: number; // e.g. 4.5% subsidized
  availableCreditLine: number;
  offers: Array<{
    id: string;
    title: string;
    description: string;
    maxAmount: number;
    interestRate: number;
    tenureMonths: number;
    purpose: 'Seasonal Seeds & Fertilizer' | 'Diesel & Machinery Advance' | 'Post-Harvest Holding' | 'Drip Irrigation';
    badge: string;
  }>;
  passportVerificationId: string;
  generatedDate: string;
}

// ==========================================
// 5. VOICE ASSISTANT NLP & DB CROSS-REFERENCE
// ==========================================
export interface DbMatchingCropLot {
  id: string;
  cropName: string;
  hindiName?: string;
  variety?: string;
  farmerName: string;
  farmerRating?: number;
  location: string;
  quantity: number;
  unit: string;
  price: number;
  qualityGrade?: string;
  bestOffer?: number;
  mandiBenchmark?: number;
  distanceKm?: number;
}

export interface DbMatchingMachine {
  id: string;
  name: string;
  hindiName?: string;
  type: string;
  ownerName: string;
  location: string;
  pricePerHour: number;
  availability: string;
  rating?: number;
}

export interface DbCrossReferenceResult {
  hasDbMatch: boolean;
  intent: 'PRICE_CHECK' | 'MARKETPLACE_SEARCH' | 'SELL_LISTING' | 'MACHINERY_RENTAL' | 'CROP_DIAGNOSIS' | 'CREDIT_FINANCE' | 'GENERAL_AGRI';
  detectedCrop: string | null;
  detectedVariety?: string | null;
  detectedLocation?: string | null;
  detectedQuantity?: number | null;
  activeLotsCount: number;
  totalVolumeQuintals: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  } | null;
  bestBuyerOffer: number | null;
  mandiBenchmarkRate: string | null;
  matchingLots: DbMatchingCropLot[];
  matchingMachinery?: DbMatchingMachine[];
  summaryBadge: string;
  groundedFacts: string;
}

// ==========================================
// 6. GROUP BULK-BUNDLING TYPES
// ==========================================
export type QualityGrade = 'A' | 'B' | 'C';
export type ListingStatus = 'active' | 'bundled' | 'sold';

export interface Listing {
  id?: string;
  farmer_id: string;
  crop_name: string;
  quantity_kg: number;
  quality_grade: QualityGrade;
  price_per_kg_asking: number;
  latitude: number;
  longitude: number;
  harvest_date: string; // ISO date format YYYY-MM-DD
  status: ListingStatus;

  // Supplementary metadata for rich display & UI integration
  farmer_name?: string;
  farmer_phone?: string;
  village_or_cluster?: string;
  distance_from_new_km?: number;
  created_at?: string;
  bundle_id?: string;
}

export interface BundleGroup {
  bundle_id: string;
  crop_name: string;
  quality_grade: QualityGrade;
  anchor_listing: Listing;
  matched_listings: Listing[];
  all_listings: Listing[];
  total_quantity_kg: number;
  farmer_count: number;
  average_price_per_kg_asking: number;
  recommended_bulk_price_per_kg: number;
  total_estimated_value: number;
  bulk_premium_earned: number; // Extra money gained collectively from bulk pricing
  center_latitude: number;
  center_longitude: number;
  max_distance_km: number;
  harvest_date_window: {
    start: string;
    end: string;
    max_day_spread: number;
  };
  status: 'potential' | 'active' | 'sold';
  cluster_name?: string;
  buyer_bids?: {
    buyer_name: string;
    company: string;
    offered_price_per_kg: number;
    pickup_terms: string;
  }[];
  created_at?: string;
}


