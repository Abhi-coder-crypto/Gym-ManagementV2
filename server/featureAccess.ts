import { Package, Client } from '@shared/schema';

/**
 * Feature access levels for different packages
 */
const PACKAGE_FEATURES: Record<string, string[]> = {
  'Fit Basics': ['workouts', 'diet', 'recorded_videos'],
  'Fit Plus': ['recorded_videos', 'personalized_diet', 'weekly_checkins'],
  'Pro Transformation': ['recorded_videos', 'personalized_diet', 'weekly_checkins', 'one_on_one_calls', 'habit_coaching'],
  'Elite Athlete': ['recorded_videos', 'personalized_diet', 'weekly_checkins', 'one_on_one_calls', 'habit_coaching', 'performance_tracking', 'priority_support'],
};

/**
 * Check if a client has valid active subscription
 */
export function isSubscriptionActive(client: Client): boolean {
  if (!client.subscriptionEndDate) return false;
  return new Date() < new Date(client.subscriptionEndDate);
}

/**
 * Get remaining days in subscription
 */
export function getRemainingDays(client: Client): number {
  if (!client.subscriptionEndDate) return 0;
  const endDate = new Date(client.subscriptionEndDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if client has access to a specific feature
 */
export function hasFeatureAccess(
  packageName: string | null | undefined,
  requiredFeature: string
): boolean {
  if (!packageName) return false;
  const features = PACKAGE_FEATURES[packageName] || [];
  return features.includes(requiredFeature);
}

/**
 * Get all features for a package
 */
export function getPackageFeatures(packageName: string | null | undefined): string[] {
  if (!packageName) return [];
  return PACKAGE_FEATURES[packageName] || [];
}

/**
 * Check if feature is accessible and subscription is active
 */
export function canAccessFeature(
  client: Client,
  packageName: string | null | undefined,
  requiredFeature: string
): boolean {
  // Must have active subscription
  if (!isSubscriptionActive(client)) {
    return false;
  }
  // Must have feature in their package
  return hasFeatureAccess(packageName, requiredFeature);
}

/**
 * Calculate subscription end date based on duration
 */
export function calculateEndDate(durationWeeks: number): Date {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationWeeks * 7);
  return endDate;
}

/**
 * Package pricing and info
 */
export const PACKAGE_INFO = {
  'Fit Basics': { price: 2500, features: ['workouts', 'diet', 'recorded_videos'] },
  'Fit Plus': { price: 5000, features: ['recorded_videos', 'personalized_diet', 'weekly_checkins'] },
  'Pro Transformation': { price: 7500, features: ['recorded_videos', 'personalized_diet', 'weekly_checkins', 'one_on_one_calls', 'habit_coaching'] },
  'Elite Athlete': { price: 10000, features: ['recorded_videos', 'personalized_diet', 'weekly_checkins', 'one_on_one_calls', 'habit_coaching', 'performance_tracking', 'priority_support'] },
};

/**
 * Duration options for all packages
 */
export const DURATION_OPTIONS = [4, 8, 12]; // weeks
