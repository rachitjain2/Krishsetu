import { Listing, BundleGroup, QualityGrade, ListingStatus } from '../types';
import { INITIAL_BUNDLING_LISTINGS } from '../data/bundlingData';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula (returned in kilometers).
 */
export function calculate_haversine_distance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Calculates the absolute day difference between two date strings (YYYY-MM-DD or ISO).
 */
export function get_day_difference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0;
  const diffMs = Math.abs(d1 - d2);
  return Math.round((diffMs / (1000 * 60 * 60 * 24)) * 10) / 10;
}

/**
 * Computes the recommended bulk wholesale price per kg and the collective bonus
 * earned by clustering into a single consolidated lot.
 */
export function calculate_bulk_pricing(
  total_kg: number,
  avg_price_per_kg: number,
  grade: QualityGrade
): {
  recommended_bulk_price: number;
  bulk_premium_per_kg: number;
  bulk_premium_percentage: number;
  total_value: number;
  total_bonus: number;
} {
  // Bulk premium tiers based on aggregated volume (Truckloads / Institutional lots)
  // Grade A crops with 10+ MT command the highest corporate procurement premiums
  let premiumPct = 0.05; // 5% baseline for small bundles (<5 MT)

  if (total_kg >= 20000) {
    premiumPct = 0.12; // 12% premium for multi-truckload lots (20+ MT)
  } else if (total_kg >= 10000) {
    premiumPct = 0.095; // 9.5% premium for full truckload lot (10-20 MT)
  } else if (total_kg >= 5000) {
    premiumPct = 0.075; // 7.5% premium for half-truckload (5-10 MT)
  }

  // Grade adjustment
  if (grade === 'A') premiumPct += 0.015; // +1.5% for export/mill quality
  if (grade === 'C') premiumPct = Math.max(0.03, premiumPct - 0.02);

  const bulk_premium_per_kg = Math.round(avg_price_per_kg * premiumPct * 100) / 100;
  const recommended_bulk_price = Math.round((avg_price_per_kg + bulk_premium_per_kg) * 100) / 100;
  const total_value = Math.round(total_kg * recommended_bulk_price);
  const total_bonus = Math.round(total_kg * bulk_premium_per_kg);

  return {
    recommended_bulk_price,
    bulk_premium_per_kg,
    bulk_premium_percentage: Math.round(premiumPct * 1000) / 10,
    total_value,
    total_bonus,
  };
}

/**
 * Core Requirement 2: CLUSTERING LOGIC
 *
 * find_bundle_candidates(new_listing)
 * - Finds all other "active" listings within a configurable radius (default 5km) using lat/long distance
 * - Filters to same crop_name and same quality_grade
 * - Filters to harvest_date within a 3-day window of each other
 * - Returns the matching group as a potential bundle
 *
 * @param new_listing - The target listing to find bundle candidates for
 * @param candidate_pool - Optional array of active listings (defaults to INITIAL_BUNDLING_LISTINGS)
 * @param radius_km - Configurable geographic radius (default 5km)
 * @param day_window - Configurable harvest date window in days (default 3 days)
 * @returns BundleGroup with matched candidates and aggregated bulk metrics, or null if no matches
 */
export function find_bundle_candidates(
  new_listing: Listing,
  candidate_pool: Listing[] = INITIAL_BUNDLING_LISTINGS,
  radius_km: number = 5,
  day_window: number = 3
): BundleGroup | null {
  if (!new_listing) return null;

  const targetCrop = (new_listing.crop_name || '').trim().toLowerCase();
  const targetGrade = (new_listing.quality_grade || 'A').toUpperCase();
  const targetLat = Number(new_listing.latitude);
  const targetLon = Number(new_listing.longitude);
  const targetHarvestDate = new_listing.harvest_date;

  // Filter candidate pool
  const matched_listings: Listing[] = [];

  for (const listing of candidate_pool) {
    // 1. Must be "active"
    if (listing.status !== 'active') {
      continue;
    }

    // 2. Must not be the identical listing itself
    if (listing.id && new_listing.id && listing.id === new_listing.id) {
      continue;
    }
    if (
      listing.farmer_id === new_listing.farmer_id &&
      listing.crop_name === new_listing.crop_name &&
      listing.harvest_date === new_listing.harvest_date &&
      listing.quantity_kg === new_listing.quantity_kg
    ) {
      continue;
    }

    // 3. Filter to same crop_name (case-insensitive)
    const itemCrop = (listing.crop_name || '').trim().toLowerCase();
    if (itemCrop !== targetCrop) {
      continue;
    }

    // 4. Filter to same quality_grade
    const itemGrade = (listing.quality_grade || '').toUpperCase();
    if (itemGrade !== targetGrade) {
      continue;
    }

    // 5. Filter to harvest_date within a 3-day window of each other
    const dateDiffDays = get_day_difference(targetHarvestDate, listing.harvest_date);
    if (dateDiffDays > day_window) {
      continue;
    }

    // 6. Within configurable radius (default 5km) using lat/long distance
    const distKm = calculate_haversine_distance(
      targetLat,
      targetLon,
      Number(listing.latitude),
      Number(listing.longitude)
    );

    if (distKm <= radius_km) {
      matched_listings.push({
        ...listing,
        distance_from_new_km: distKm,
      });
    }
  }

  // If no other candidates match, return null or an empty bundle group indicator
  if (matched_listings.length === 0) {
    return null;
  }

  // Sort matched listings by closest distance first
  matched_listings.sort((a, b) => (a.distance_from_new_km || 0) - (b.distance_from_new_km || 0));

  // Combine anchor listing + matched listings
  const all_listings: Listing[] = [
    { ...new_listing, distance_from_new_km: 0 },
    ...matched_listings,
  ];

  // Calculate aggregated volume
  const total_quantity_kg = all_listings.reduce(
    (sum, item) => sum + (Number(item.quantity_kg) || 0),
    0
  );

  // Calculate weighted average asking price
  const totalWeightedAsking = all_listings.reduce(
    (sum, item) => sum + (Number(item.quantity_kg) || 0) * (Number(item.price_per_kg_asking) || 0),
    0
  );
  const average_price_per_kg_asking =
    total_quantity_kg > 0 ? Math.round((totalWeightedAsking / total_quantity_kg) * 100) / 100 : 0;

  // Calculate bulk wholesale pricing & extra bonus earned
  const pricing = calculate_bulk_pricing(
    total_quantity_kg,
    average_price_per_kg_asking,
    targetGrade as QualityGrade
  );

  // Compute cluster geographic center
  const center_latitude =
    Math.round(
      (all_listings.reduce((sum, item) => sum + Number(item.latitude), 0) / all_listings.length) *
        10000
    ) / 10000;
  const center_longitude =
    Math.round(
      (all_listings.reduce((sum, item) => sum + Number(item.longitude), 0) / all_listings.length) *
        10000
    ) / 10000;

  // Calculate maximum distance between any member and anchor
  const max_distance_km = matched_listings.reduce(
    (max, item) => Math.max(max, item.distance_from_new_km || 0),
    0
  );

  // Harvest date range
  const harvestDates = all_listings.map((l) => l.harvest_date).sort();
  const startHarvest = harvestDates[0];
  const endHarvest = harvestDates[harvestDates.length - 1];
  const max_day_spread = get_day_difference(startHarvest, endHarvest);

  // Unique farmers count
  const uniqueFarmers = new Set(all_listings.map((l) => l.farmer_id));

  const bundleGroup: BundleGroup = {
    bundle_id: `BUNDLE-${targetCrop.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    crop_name: new_listing.crop_name,
    quality_grade: targetGrade as QualityGrade,
    anchor_listing: new_listing,
    matched_listings,
    all_listings,
    total_quantity_kg,
    farmer_count: uniqueFarmers.size,
    average_price_per_kg_asking,
    recommended_bulk_price_per_kg: pricing.recommended_bulk_price,
    total_estimated_value: pricing.total_value,
    bulk_premium_earned: pricing.total_bonus,
    center_latitude,
    center_longitude,
    max_distance_km,
    harvest_date_window: {
      start: startHarvest,
      end: endHarvest,
      max_day_spread,
    },
    status: 'potential',
    cluster_name: new_listing.village_or_cluster || 'Ujjain Malwa Agri-Cluster',
    buyer_bids: [
      {
        buyer_name: 'ITC Agri Business Hub',
        company: 'ITC Chaupal Saagar Procurement',
        offered_price_per_kg: pricing.recommended_bulk_price + 0.40,
        pickup_terms: 'Direct Farmgate Combined Dispatch (Truck Arranged)',
      },
      {
        buyer_name: 'Adani Wilmar Logistics',
        company: 'Adani Wilmar Limited',
        offered_price_per_kg: pricing.recommended_bulk_price + 0.20,
        pickup_terms: 'FPO Common Collection Center Payment on Weighment',
      },
    ],
    created_at: new Date().toISOString(),
  };

  return bundleGroup;
}

/**
 * Clusters all active listings into candidate bundle groups.
 */
export function cluster_all_listings(
  listings: Listing[],
  radius_km: number = 5,
  day_window: number = 3
): BundleGroup[] {
  const activeListings = listings.filter((l) => l.status === 'active');
  const bundles: BundleGroup[] = [];
  const processedListingIds = new Set<string>();

  for (const listing of activeListings) {
    if (listing.id && processedListingIds.has(listing.id)) {
      continue;
    }

    const bundle = find_bundle_candidates(listing, activeListings, radius_km, day_window);
    if (bundle && bundle.matched_listings.length > 0) {
      bundles.push(bundle);
      // Mark all participating listings as clustered in this pass
      bundle.all_listings.forEach((item) => {
        if (item.id) processedListingIds.add(item.id);
      });
    }
  }

  return bundles;
}

/**
 * Creates and saves a confirmed bundle, transitioning member listings to 'bundled'
 */
export async function confirm_and_lock_bundle(
  bundle: BundleGroup,
  listingsStateUpdater?: (updated: Listing[]) => void,
  currentListings?: Listing[]
): Promise<BundleGroup> {
  const lockedBundle: BundleGroup = {
    ...bundle,
    status: 'active',
  };

  // Update in-memory state if updater provided
  if (listingsStateUpdater && currentListings) {
    const memberIds = new Set(bundle.all_listings.map((l) => l.id).filter(Boolean));
    const updatedListings = currentListings.map((l) => {
      if (l.id && memberIds.has(l.id)) {
        return { ...l, status: 'bundled' as ListingStatus, bundle_id: bundle.bundle_id };
      }
      return l;
    });
    listingsStateUpdater(updatedListings);
  }

  // Persist to Firestore if available
  try {
    const bundleDocRef = doc(db, 'bundles', bundle.bundle_id);
    await setDoc(bundleDocRef, lockedBundle);

    const batch = writeBatch(db);
    for (const item of bundle.all_listings) {
      if (item.id) {
        const listingDocRef = doc(db, 'listings', item.id);
        batch.update(listingDocRef, {
          status: 'bundled',
          bundle_id: bundle.bundle_id,
          updated_at: new Date().toISOString(),
        });
      }
    }
    await batch.commit();
  } catch (err) {
    console.warn('Firestore bundle lock notice (persisting locally):', err);
  }

  return lockedBundle;
}

/**
 * Subscribe to listings from Firestore, with fallback to initial seed data
 */
export function subscribe_to_listings(
  onData: (listings: Listing[]) => void,
  onError?: (err: any) => void
) {
  const listingsRef = collection(db, 'listings');
  return onSnapshot(
    listingsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_BUNDLING_LISTINGS);
        return;
      }
      const list: Listing[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Listing);
      });
      onData(list);
    },
    (error) => {
      console.warn('Firestore listings subscription notice:', error?.message || error);
      if (onError) onError(error);
      onData(INITIAL_BUNDLING_LISTINGS);
    }
  );
}

/**
 * Creates a new listing in Firestore or local state
 */
export async function create_listing(listing: Listing): Promise<Listing> {
  const id = listing.id || `LST-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullListing: Listing = {
    ...listing,
    id,
    created_at: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'listings', id);
    await setDoc(docRef, fullListing);
  } catch (err) {
    console.warn('Firestore listing create notice (saved locally):', err);
  }

  return fullListing;
}
