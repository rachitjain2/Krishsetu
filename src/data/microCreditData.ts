import { KisanMicroCreditProfile } from '../types';

export const INITIAL_KISAN_CREDIT_PROFILE: KisanMicroCreditProfile = {
  farmerUid: 'demo-farmer-ramesh',
  farmerName: 'Ramesh Patel',
  farmerPhone: '+91 98260 12345',
  landHoldingAcres: 6.5,
  overallScore: 785, // 300 to 900 scale (Excellent)
  scoreTier: 'AAA (Prime Farmer)',
  percentileRanking: 94, // Top 6% in regional Malwa zone
  pillars: {
    machineryDiscipline: {
      name: 'Machinery Rental Discipline',
      hindiName: 'कृषि मशीनरी समयबद्धता व भुगतान रिकॉर्ड',
      score: 96,
      weight: 30,
      status: 'Excellent',
      metrics: [
        '14/14 on-time machinery check-in & return',
        '0 equipment damage reports over 24 months',
        '100% prompt OTP verification on field arrival',
      ],
      keyInsight: 'Punctual machinery handback and zero operator disputes establish high operational reliability.',
    },
    auctionFulfillment: {
      name: 'Produce Auction & Trade Fulfillment',
      hindiName: 'मंडी व रिवर्स ऑक्शन फसल आपूर्ति निष्ठा',
      score: 92,
      weight: 25,
      status: 'Excellent',
      metrics: [
        '98.6% batch delivery fulfillment rate',
        'Zero quality-rejection disputes at buyer weighbridges',
        'NABL moisture & grade certification consistency',
      ],
      keyInsight: 'Consistently supplies verified Grade A+ crops matching listed moisture specs without shortfall.',
    },
    satelliteYieldConsistency: {
      name: 'Satellite NDVI Health & Yield Track Record',
      hindiName: 'उपग्रह (Sentinel-2) फसल स्वास्थ्य व उपज स्थिरता',
      score: 88,
      weight: 20,
      status: 'Excellent',
      metrics: [
        'Multi-season Sentinel-2 NDVI peak maintained >0.80',
        'Actual harvest vs AI predicted yield variance <4.2%',
        'Zero crop abandonment or catastrophic drought failure',
      ],
      keyInsight: 'Multispectral satellite time series proves stable biomass management across 6 consecutive Kharif/Rabi cycles.',
    },
    escrowTransactionVolume: {
      name: 'Escrow Payment Velocity & Turnover',
      hindiName: 'एस्क्रो लेनदेन मूल्य व नियमितता',
      score: 90,
      weight: 15,
      status: 'Excellent',
      metrics: [
        '₹8,45,000+ processed through KrishiSetu Escrow',
        '100% clean escrow release with zero chargeback claims',
        'Average settlement turnaround: <12 minutes',
      ],
      keyInsight: 'Substantial transparent escrow turnover proves liquidity and robust cashflow management.',
    },
    soilAndLandTenure: {
      name: 'Land Tenure & Verified Soil Index',
      hindiName: 'भूमि रिकॉर्ड (खसरा-खतौनी) व मृदा उर्वरता',
      score: 85,
      weight: 10,
      status: 'Good',
      metrics: [
        'Verified digital Khasra 42/1 land ownership title',
        'Soil Organic Carbon 0.82% (High fertility range)',
        'Active soil health card renewed annually',
      ],
      keyInsight: 'Secure unencumbered land tenure backed by state revenue registry and healthy black vertisol soil.',
    },
  },
  totalEscrowVolumeProcessed: 845000,
  onTimeSettlementRate: 99.1,
  completedAuctionsCount: 16,
  disputeFreeTrips: 34,
  preApprovedLoanAmount: 125000, // ₹1,25,000 pre-approved
  interestRatePerAnnum: 4.5, // 4.5% p.a. subsidized rate (backed by Priority Sector Lending)
  availableCreditLine: 125000,
  offers: [
    {
      id: 'OFFER-SEED-FERT',
      title: 'Kisan Seasonal Input Advance',
      description: 'Zero-collateral micro-credit for certified seeds, bio-fertilizers, and micronutrients before sowing.',
      maxAmount: 50000,
      interestRate: 4.0,
      tenureMonths: 6,
      purpose: 'Seasonal Seeds & Fertilizer',
      badge: 'Instant Disbursal (2 Mins)',
    },
    {
      id: 'OFFER-DIESEL-MACH',
      title: 'Machinery & Diesel Working Capital',
      description: 'Pre-harvest credit line linked directly to KrishiSetu machinery rental bookings & fuel pumps.',
      maxAmount: 75000,
      interestRate: 4.5,
      tenureMonths: 4,
      purpose: 'Diesel & Machinery Advance',
      badge: 'Auto-Pay with Escrow',
    },
    {
      id: 'OFFER-POST-HARVEST',
      title: 'Warehouse Holding Credit Line',
      description: 'Avoid distress selling at harvest peak. Borrow up to 70% of warehouse electronic negotiable receipt value.',
      maxAmount: 125000,
      interestRate: 5.2,
      tenureMonths: 9,
      purpose: 'Post-Harvest Holding',
      badge: 'Wait for Peak Mandi Price',
    },
  ],
  passportVerificationId: 'KS-FIN-INCL-MP-785-RAMESH-2026',
  generatedDate: '02 Sep 2026',
};
