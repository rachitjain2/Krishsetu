import { FieldPlotGeometry, YieldRegressionResult } from '../types';

export const DEMO_AGRICULTURAL_PLOTS: FieldPlotGeometry[] = [
  {
    plotId: 'PLOT-MP-UJJAIN-101',
    plotName: 'Ramesh Patel - Malwa Black Soil Field A',
    farmerName: 'Ramesh Patel',
    latitude: 23.1765,
    longitude: 75.7885,
    areaAcres: 6.5,
    soilType: 'Deep Vertisol (Rich Malwa Black Cotton Soil)',
    soilOrganicCarbon: 0.82, // % (High fertility)
    nitrogenIndex: 'Optimal (310 kg/ha available N)',
    irrigationSource: 'Tube-well + Micro Drip System',
    currentCrop: 'Sharbati Wheat (C-306)',
    sowingDate: '2025-11-15',
    expectedHarvestDate: '2026-03-22',
    clusterLocation: 'Ujjain Agricultural Cluster, Madhya Pradesh',
    boundaryCoordinates: [
      { lat: 23.1790, lng: 75.7860 },
      { lat: 23.1792, lng: 75.7915 },
      { lat: 23.1742, lng: 75.7910 },
      { lat: 23.1740, lng: 75.7858 },
    ],
  },
  {
    plotId: 'PLOT-PB-LUDHIANA-202',
    plotName: 'Gurpreet Singh - Ludhiana Alluvial Belt Field B',
    farmerName: 'Gurpreet Singh',
    latitude: 30.9010,
    longitude: 75.8573,
    areaAcres: 12.0,
    soilType: 'Alluvial Loam (Indo-Gangetic Plain)',
    soilOrganicCarbon: 0.71,
    nitrogenIndex: 'High (345 kg/ha available N)',
    irrigationSource: 'Canal Lift + Precision Sprinkler',
    currentCrop: 'HD-2967 High-Yield Wheat',
    sowingDate: '2025-11-05',
    expectedHarvestDate: '2026-04-05',
    clusterLocation: 'Ludhiana Agricultural District, Punjab',
    boundaryCoordinates: [
      { lat: 30.9040, lng: 75.8540 },
      { lat: 30.9045, lng: 75.8610 },
      { lat: 30.8980, lng: 75.8605 },
      { lat: 30.8975, lng: 75.8535 },
    ],
  },
  {
    plotId: 'PLOT-MH-NASHIK-303',
    plotName: 'Kailash Sonawane - Godavari Basin Onion Field',
    farmerName: 'Kailash Sonawane',
    latitude: 19.9975,
    longitude: 73.7898,
    areaAcres: 4.8,
    soilType: 'Medium Black Volcanic Loam',
    soilOrganicCarbon: 0.76,
    nitrogenIndex: 'Medium (260 kg/ha available N)',
    irrigationSource: 'Farm Pond + Drip Fertigation',
    currentCrop: 'Nashik Red Onion (Late Kharif/Rabi)',
    sowingDate: '2025-12-01',
    expectedHarvestDate: '2026-03-30',
    clusterLocation: 'Lasalgaon / Niphad Belt, Nashik, Maharashtra',
    boundaryCoordinates: [
      { lat: 20.0005, lng: 73.7870 },
      { lat: 20.0010, lng: 73.7930 },
      { lat: 19.9950, lng: 73.7925 },
      { lat: 19.9945, lng: 73.7865 },
    ],
  },
  {
    plotId: 'PLOT-AP-GUNTUR-404',
    plotName: 'Venkatesh Rao - Krishna Delta Chilli Plot',
    farmerName: 'Venkatesh Rao',
    latitude: 16.3067,
    longitude: 80.4365,
    areaAcres: 5.2,
    soilType: 'Clayey Alluvial Delta Soil',
    soilOrganicCarbon: 0.88,
    nitrogenIndex: 'Optimal (320 kg/ha available N)',
    irrigationSource: 'Krishna Right Canal Sub-distributary',
    currentCrop: 'Teja Guntur Red Chilli',
    sowingDate: '2025-10-20',
    expectedHarvestDate: '2026-02-28',
    clusterLocation: 'Guntur Rural Agricultural Zone, Andhra Pradesh',
    boundaryCoordinates: [
      { lat: 16.3095, lng: 80.4335 },
      { lat: 16.3100, lng: 80.4395 },
      { lat: 16.3040, lng: 80.4390 },
      { lat: 16.3035, lng: 80.4330 },
    ],
  },
];

export const SATELLITE_YIELD_MODELS: Record<string, YieldRegressionResult> = {
  'PLOT-MP-UJJAIN-101': {
    predictedYieldPerAcre: 23.4, // Qtl/Acre
    confidenceMarginQuintals: 1.1, // ±1.1 Qtl
    totalPredictedHarvest: 152.1, // 6.5 acres * 23.4
    predictedHarvestWindow: '18 Mar 2026 – 26 Mar 2026',
    baselineHistoricalAvg: 19.8,
    yieldDeltaPercent: 18.2, // +18.2% above regional 5-year benchmark
    modelFactors: {
      satelliteNDVIWeight: 0.40,
      thermalGDDWeight: 0.25,
      soilCarbonFactor: 0.20,
      precipitationTrend: 0.15,
    },
    cropHealthStatus: 'Vigorous / Optimal',
    spectralBands: {
      b2Blue: 0.048, // 490 nm
      b3Green: 0.082, // 560 nm
      b4Red: 0.051, // 665 nm (Strong chlorophyll absorption)
      b8NIR: 0.612, // 842 nm (High mesophyll cell structure reflectance)
      b11SWIR: 0.185, // 1610 nm (Adequate plant moisture)
    },
    ndviTrend: [
      { date: '1 Dec', week: 2, ndvi: 0.24, evi: 0.19, savi: 0.21, canopyMoisture: 42, rainfallMm: 0, gddThermalUnits: 140 },
      { date: '15 Dec', week: 4, ndvi: 0.41, evi: 0.33, savi: 0.36, canopyMoisture: 58, rainfallMm: 12, gddThermalUnits: 290 },
      { date: '1 Jan', week: 6, ndvi: 0.62, evi: 0.51, savi: 0.55, canopyMoisture: 71, rainfallMm: 5, gddThermalUnits: 460 },
      { date: '15 Jan', week: 8, ndvi: 0.77, evi: 0.65, savi: 0.69, canopyMoisture: 82, rainfallMm: 8, gddThermalUnits: 620 },
      { date: '1 Feb', week: 10, ndvi: 0.84, evi: 0.72, savi: 0.76, canopyMoisture: 79, rainfallMm: 0, gddThermalUnits: 810 },
      { date: '15 Feb', week: 12, ndvi: 0.81, evi: 0.69, savi: 0.73, canopyMoisture: 73, rainfallMm: 0, gddThermalUnits: 1010 },
      { date: '1 Mar', week: 14, ndvi: 0.71, evi: 0.59, savi: 0.64, canopyMoisture: 61, rainfallMm: 0, gddThermalUnits: 1240 },
      { date: '15 Mar', week: 16, ndvi: 0.48, evi: 0.38, savi: 0.42, canopyMoisture: 45, rainfallMm: 0, gddThermalUnits: 1490 },
    ],
    estimatedGrossRevenueMin: 372645, // 152.1 Qtl * ₹2,450 floor
    estimatedGrossRevenueMax: 416754, // 152.1 Qtl * ₹2,740 auction
    actionableAdvisory: [
      'NDVI peaked at 0.84 during grain-filling stage (Feb 1-15), demonstrating excellent photosynthetic biomass index.',
      'SWIR canopy moisture index (0.185) indicates zero drought stress during flowering.',
      'Optimal harvest window opens when NDVI drops below 0.45 (estimated March 18-24).',
      'Recommended immediate action: Cease irrigation 10 days prior to harvest to maintain grain moisture below 10.5% for Grade A+ reverse auction price.',
    ],
  },
  'PLOT-PB-LUDHIANA-202': {
    predictedYieldPerAcre: 28.6,
    confidenceMarginQuintals: 1.4,
    totalPredictedHarvest: 343.2,
    predictedHarvestWindow: '02 Apr 2026 – 10 Apr 2026',
    baselineHistoricalAvg: 24.2,
    yieldDeltaPercent: 18.1,
    modelFactors: {
      satelliteNDVIWeight: 0.40,
      thermalGDDWeight: 0.25,
      soilCarbonFactor: 0.20,
      precipitationTrend: 0.15,
    },
    cropHealthStatus: 'Vigorous / Optimal',
    spectralBands: {
      b2Blue: 0.045,
      b3Green: 0.086,
      b4Red: 0.048,
      b8NIR: 0.655,
      b11SWIR: 0.172,
    },
    ndviTrend: [
      { date: '1 Dec', week: 3, ndvi: 0.32, evi: 0.26, savi: 0.28, canopyMoisture: 52, rainfallMm: 4, gddThermalUnits: 160 },
      { date: '15 Dec', week: 5, ndvi: 0.52, evi: 0.43, savi: 0.47, canopyMoisture: 65, rainfallMm: 18, gddThermalUnits: 310 },
      { date: '1 Jan', week: 7, ndvi: 0.71, evi: 0.60, savi: 0.64, canopyMoisture: 76, rainfallMm: 6, gddThermalUnits: 480 },
      { date: '15 Jan', week: 9, ndvi: 0.82, evi: 0.71, savi: 0.75, canopyMoisture: 84, rainfallMm: 12, gddThermalUnits: 650 },
      { date: '1 Feb', week: 11, ndvi: 0.88, evi: 0.77, savi: 0.81, canopyMoisture: 82, rainfallMm: 0, gddThermalUnits: 840 },
      { date: '15 Feb', week: 13, ndvi: 0.85, evi: 0.74, savi: 0.78, canopyMoisture: 76, rainfallMm: 0, gddThermalUnits: 1050 },
      { date: '1 Mar', week: 15, ndvi: 0.78, evi: 0.66, savi: 0.70, canopyMoisture: 68, rainfallMm: 0, gddThermalUnits: 1290 },
      { date: '15 Mar', week: 17, ndvi: 0.60, evi: 0.49, savi: 0.53, canopyMoisture: 54, rainfallMm: 0, gddThermalUnits: 1540 },
    ],
    estimatedGrossRevenueMin: 840840,
    estimatedGrossRevenueMax: 933504,
    actionableAdvisory: [
      'High-density canopy index (peak NDVI 0.88) reflects heavy nitrogen uptake and strong tiller formation.',
      'Slight increase in yellow rust risk if night humidity exceeds 85%; Sentinel-2 NDRE indicates clear leaf health today.',
      'Estimated total volume 343 Quintals makes this plot ideal for single-lot bulk buyer reverse-auction listing.',
    ],
  },
  'PLOT-MH-NASHIK-303': {
    predictedYieldPerAcre: 118.0, // Qtl/Acre for Onions
    confidenceMarginQuintals: 5.5,
    totalPredictedHarvest: 566.4,
    predictedHarvestWindow: '24 Mar 2026 – 04 Apr 2026',
    baselineHistoricalAvg: 102.0,
    yieldDeltaPercent: 15.6,
    modelFactors: {
      satelliteNDVIWeight: 0.35,
      thermalGDDWeight: 0.30,
      soilCarbonFactor: 0.20,
      precipitationTrend: 0.15,
    },
    cropHealthStatus: 'Moderate / Healthy',
    spectralBands: {
      b2Blue: 0.052,
      b3Green: 0.091,
      b4Red: 0.062,
      b8NIR: 0.540,
      b11SWIR: 0.210,
    },
    ndviTrend: [
      { date: '15 Dec', week: 2, ndvi: 0.22, evi: 0.18, savi: 0.20, canopyMoisture: 48, rainfallMm: 0, gddThermalUnits: 190 },
      { date: '1 Jan', week: 4, ndvi: 0.45, evi: 0.37, savi: 0.40, canopyMoisture: 66, rainfallMm: 0, gddThermalUnits: 390 },
      { date: '15 Jan', week: 6, ndvi: 0.65, evi: 0.54, savi: 0.58, canopyMoisture: 75, rainfallMm: 0, gddThermalUnits: 610 },
      { date: '1 Feb', week: 8, ndvi: 0.74, evi: 0.62, savi: 0.66, canopyMoisture: 72, rainfallMm: 0, gddThermalUnits: 840 },
      { date: '15 Feb', week: 10, ndvi: 0.71, evi: 0.59, savi: 0.63, canopyMoisture: 65, rainfallMm: 0, gddThermalUnits: 1080 },
      { date: '1 Mar', week: 12, ndvi: 0.59, evi: 0.48, savi: 0.52, canopyMoisture: 55, rainfallMm: 0, gddThermalUnits: 1340 },
    ],
    estimatedGrossRevenueMin: 1019520, // 566.4 Qtl * ₹1,800/Qtl
    estimatedGrossRevenueMax: 1359360, // 566.4 Qtl * ₹2,400/Qtl
    actionableAdvisory: [
      'Bulb enlargement stage confirmed by gradual canopy senescence trend.',
      'Potassium foliar spray applied in week 8 has successfully boosted bulb diameter uniformity.',
      'Storage quality index: High (dry matter estimated >12.4%).',
    ],
  },
  'PLOT-AP-GUNTUR-404': {
    predictedYieldPerAcre: 18.2, // Qtl/Acre for dry chilli
    confidenceMarginQuintals: 0.9,
    totalPredictedHarvest: 94.6,
    predictedHarvestWindow: '22 Feb 2026 – 05 Mar 2026',
    baselineHistoricalAvg: 15.5,
    yieldDeltaPercent: 17.4,
    modelFactors: {
      satelliteNDVIWeight: 0.40,
      thermalGDDWeight: 0.25,
      soilCarbonFactor: 0.20,
      precipitationTrend: 0.15,
    },
    cropHealthStatus: 'Vigorous / Optimal',
    spectralBands: {
      b2Blue: 0.046,
      b3Green: 0.088,
      b4Red: 0.054,
      b8NIR: 0.590,
      b11SWIR: 0.165,
    },
    ndviTrend: [
      { date: '15 Nov', week: 3, ndvi: 0.28, evi: 0.23, savi: 0.25, canopyMoisture: 55, rainfallMm: 22, gddThermalUnits: 240 },
      { date: '1 Dec', week: 5, ndvi: 0.48, evi: 0.40, savi: 0.43, canopyMoisture: 70, rainfallMm: 15, gddThermalUnits: 490 },
      { date: '15 Dec', week: 7, ndvi: 0.68, evi: 0.57, savi: 0.61, canopyMoisture: 78, rainfallMm: 0, gddThermalUnits: 750 },
      { date: '1 Jan', week: 9, ndvi: 0.79, evi: 0.67, savi: 0.71, canopyMoisture: 80, rainfallMm: 0, gddThermalUnits: 1020 },
      { date: '15 Jan', week: 11, ndvi: 0.76, evi: 0.64, savi: 0.68, canopyMoisture: 74, rainfallMm: 0, gddThermalUnits: 1300 },
      { date: '1 Feb', week: 13, ndvi: 0.65, evi: 0.53, savi: 0.57, canopyMoisture: 60, rainfallMm: 0, gddThermalUnits: 1590 },
      { date: '15 Feb', week: 15, ndvi: 0.52, evi: 0.41, savi: 0.45, canopyMoisture: 48, rainfallMm: 0, gddThermalUnits: 1890 },
    ],
    estimatedGrossRevenueMin: 1797400, // 94.6 Qtl * ₹19,000/Qtl Teja Chilli
    estimatedGrossRevenueMax: 2175800, // 94.6 Qtl * ₹23,000/Qtl
    actionableAdvisory: [
      'SHU (Scoville Heat Units) projected above 75,000 based on warm thermal ripening index.',
      'First picking completed with 98% deep red fruit coloration.',
      'Direct reverse auction with spice exporters recommended due to high export quality index.',
    ],
  },
};
