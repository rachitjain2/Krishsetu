import { Listing } from '../types';

/**
 * Realistic seed listings for KrishiSetu's Group Bulk-Bundling engine.
 * Centered around the Ujjain/Malwa agricultural belt in Madhya Pradesh, India.
 * Base coordinates: Latitude ~23.180, Longitude ~75.780
 */
export const INITIAL_BUNDLING_LISTINGS: Listing[] = [
  // --- CLUSTER 1: Sharbati Wheat (Grade A) - Nearby within 1.5 - 4.2 km ---
  {
    id: 'LST-WHEAT-001',
    farmer_id: 'FARM-01-RAMESH',
    farmer_name: 'Ramesh Patel (रमेश पटेल)',
    farmer_phone: '9826012345',
    village_or_cluster: 'Lekoda Village, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 3500, // 35 Quintals
    quality_grade: 'A',
    price_per_kg_asking: 26.50, // ₹2,650 / Qtl
    latitude: 23.1824,
    longitude: 75.7792,
    harvest_date: '2026-03-15',
    status: 'active',
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'LST-WHEAT-002',
    farmer_id: 'FARM-02-SURESH',
    farmer_name: 'Suresh Choudhary (सुरेश चौधरी)',
    farmer_phone: '9826198765',
    village_or_cluster: 'Tajpur Khurd, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 5200, // 52 Quintals
    quality_grade: 'A',
    price_per_kg_asking: 26.80,
    latitude: 23.1950,
    longitude: 75.7910, // ~1.8 km from Lekoda
    harvest_date: '2026-03-16', // 1 day difference
    status: 'active',
    created_at: '2026-03-01T09:30:00Z',
  },
  {
    id: 'LST-WHEAT-003',
    farmer_id: 'FARM-03-DINESH',
    farmer_name: 'Dinesh Mukati (दिनेश मुकाती)',
    farmer_phone: '9425043210',
    village_or_cluster: 'Ghatia Tehsil, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 4800, // 48 Quintals
    quality_grade: 'A',
    price_per_kg_asking: 26.20,
    latitude: 23.1710,
    longitude: 75.7650, // ~2.1 km from Lekoda
    harvest_date: '2026-03-17', // 2 days difference
    status: 'active',
    created_at: '2026-03-02T06:15:00Z',
  },
  {
    id: 'LST-WHEAT-004',
    farmer_id: 'FARM-04-JAGDISH',
    farmer_name: 'Jagdish Gurjar (जगदीश गुर्जर)',
    farmer_phone: '9752099112',
    village_or_cluster: 'Pingleshwar Road, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 6500, // 65 Quintals
    quality_grade: 'A',
    price_per_kg_asking: 27.00,
    latitude: 23.2010,
    longitude: 75.8050, // ~3.4 km from Lekoda
    harvest_date: '2026-03-14', // 1 day before
    status: 'active',
    created_at: '2026-03-02T11:00:00Z',
  },

  // --- FILTER NEGATIVE TEST CASES (Will not match 5km radius or 3-day window or Grade) ---
  {
    id: 'LST-WHEAT-FAR-005',
    farmer_id: 'FARM-05-VIKRAM',
    farmer_name: 'Vikram Singh (विक्रम सिंह)',
    farmer_phone: '9893011223',
    village_or_cluster: 'Badnagar Mandi (Far 18km)',
    crop_name: 'Wheat',
    quantity_kg: 8000,
    quality_grade: 'A',
    price_per_kg_asking: 26.00,
    latitude: 23.0100, // ~19 km away (should be excluded by 5km radius filter)
    longitude: 75.6100,
    harvest_date: '2026-03-16',
    status: 'active',
    created_at: '2026-03-02T12:00:00Z',
  },
  {
    id: 'LST-WHEAT-DIFFDATE-006',
    farmer_id: 'FARM-06-OMPRAKASH',
    farmer_name: 'Omprakash Meena (ओमप्रकाश मीणा)',
    farmer_phone: '9826312456',
    village_or_cluster: 'Lekoda East, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 4000,
    quality_grade: 'A',
    price_per_kg_asking: 26.50,
    latitude: 23.1830,
    longitude: 75.7820, // ~0.4 km (Very close)
    harvest_date: '2026-03-29', // 14 days difference (should be excluded by 3-day window filter)
    status: 'active',
    created_at: '2026-03-02T14:30:00Z',
  },
  {
    id: 'LST-WHEAT-GRADEB-007',
    farmer_id: 'FARM-07-MOHAN',
    farmer_name: 'Mohanlal Verma (मोहनलाल वर्मा)',
    farmer_phone: '9425123987',
    village_or_cluster: 'Nagziri Rural, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 3200,
    quality_grade: 'B', // Grade B (should be excluded when clustering for Grade A)
    price_per_kg_asking: 24.50,
    latitude: 23.1860,
    longitude: 75.7890, // ~1.1 km away
    harvest_date: '2026-03-15',
    status: 'active',
    created_at: '2026-03-02T15:00:00Z',
  },

  // --- CLUSTER 2: Yellow Mustard (Grade A) - 3 Nearby Farmers ---
  {
    id: 'LST-MSTRD-001',
    farmer_id: 'FARM-08-HARI',
    farmer_name: 'Hariom Patidar (हरिओम पाटीदार)',
    farmer_phone: '9827011998',
    village_or_cluster: 'Unhel Road Hub, Ujjain',
    crop_name: 'Mustard',
    quantity_kg: 3800,
    quality_grade: 'A',
    price_per_kg_asking: 54.50,
    latitude: 23.1920,
    longitude: 75.7680,
    harvest_date: '2026-03-10',
    status: 'active',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'LST-MSTRD-002',
    farmer_id: 'FARM-09-RAJKUMAR',
    farmer_name: 'Rajkumar Sharma (राजकुमार शर्मा)',
    farmer_phone: '9893122334',
    village_or_cluster: 'Maksi Bypass, Ujjain',
    crop_name: 'Mustard',
    quantity_kg: 4200,
    quality_grade: 'A',
    price_per_kg_asking: 55.00,
    latitude: 23.1990,
    longitude: 75.7780, // ~1.3 km away
    harvest_date: '2026-03-11',
    status: 'active',
    created_at: '2026-03-01T11:45:00Z',
  },
  {
    id: 'LST-MSTRD-003',
    farmer_id: 'FARM-10-KAILASH',
    farmer_name: 'Kailash Solanki (कैलाश सोलंकी)',
    farmer_phone: '9424098877',
    village_or_cluster: 'Bherugarh Sector, Ujjain',
    crop_name: 'Mustard',
    quantity_kg: 2900,
    quality_grade: 'A',
    price_per_kg_asking: 54.00,
    latitude: 23.1880,
    longitude: 75.7590, // ~1.2 km away
    harvest_date: '2026-03-12',
    status: 'active',
    created_at: '2026-03-01T14:10:00Z',
  },

  // --- CLUSTER 3: Desi Chana / Chickpea (Grade A) ---
  {
    id: 'LST-CHANA-001',
    farmer_id: 'FARM-11-ANIL',
    farmer_name: 'Anil Sisodiya (अनिल सिसौदिया)',
    farmer_phone: '9826088776',
    village_or_cluster: 'Ghattia South, Ujjain',
    crop_name: 'Chickpea',
    quantity_kg: 4500,
    quality_grade: 'A',
    price_per_kg_asking: 49.50,
    latitude: 23.1750,
    longitude: 75.7850,
    harvest_date: '2026-03-20',
    status: 'active',
    created_at: '2026-03-02T16:00:00Z',
  },
  {
    id: 'LST-CHANA-002',
    farmer_id: 'FARM-12-MAHENDRA',
    farmer_name: 'Mahendra Bais (महेंद्र बैस)',
    farmer_phone: '9893988776',
    village_or_cluster: 'Sanwer Border, Ujjain',
    crop_name: 'Chickpea',
    quantity_kg: 5000,
    quality_grade: 'A',
    price_per_kg_asking: 50.00,
    latitude: 23.1690,
    longitude: 75.7920, // ~1.0 km away
    harvest_date: '2026-03-21',
    status: 'active',
    created_at: '2026-03-02T17:15:00Z',
  },

  // --- ALREADY BUNDLED LISTING EXAMPLE ---
  {
    id: 'LST-WHEAT-BUNDLED-008',
    farmer_id: 'FARM-13-RAMLAL',
    farmer_name: 'Ramlal Dangi (रामलाल दांगी)',
    farmer_phone: '9826055443',
    village_or_cluster: 'Jiwajiganj, Ujjain',
    crop_name: 'Wheat',
    quantity_kg: 6000,
    quality_grade: 'A',
    price_per_kg_asking: 26.50,
    latitude: 23.1810,
    longitude: 75.7750,
    harvest_date: '2026-03-15',
    status: 'bundled', // Already locked in a previous bundle, so must be skipped by active filter!
    bundle_id: 'BUNDLE-KS-2026-901',
    created_at: '2026-02-28T09:00:00Z',
  },
];
