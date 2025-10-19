import type { TradeRating, InventoryItem } from '../types';

/**
 * Calculate trade rating from viewer's perspective
 * Based on: great/fair/bad classification
 *
 * Rating logic (viewer POV):
 * - offerSum = sum(MID values of viewer's selected items)
 * - listingMid = estimated MID for the listing
 * - netAdv = listingMid − offerSum
 *
 * Classify:
 * - great: netAdv ≥ max(25, 0.15 * listingMid)
 * - fair: |netAdv| < max(25, 0.15 * listingMid)
 * - bad: netAdv ≤ −max(25, 0.15 * listingMid)
 */
export function calculateTradeRating(
  viewerOfferValue: number,
  targetItemValue: number
): TradeRating {
  const netAdv = targetItemValue - viewerOfferValue;
  const threshold = Math.max(25, 0.15 * targetItemValue);

  if (netAdv >= threshold) {
    return 'great';
  } else if (Math.abs(netAdv) < threshold) {
    return 'fair';
  } else {
    return 'bad';
  }
}

/**
 * Get rating chip properties (color, label, icon)
 */
export function getRatingChipProps(rating: TradeRating): {
  color: string;
  label: string;
  icon: string;
  description: string;
} {
  switch (rating) {
    case 'great':
      return {
        color: '#10b981', // green
        label: 'Great for you',
        icon: '✓',
        description: 'This trade is in your favor',
      };
    case 'fair':
      return {
        color: '#f59e0b', // yellow/amber
        label: 'Even swap',
        icon: '≈',
        description: 'This is a balanced trade',
      };
    case 'bad':
      return {
        color: '#ef4444', // red
        label: 'Not a good swap',
        icon: '!',
        description: 'This trade is not in your favor',
      };
  }
}

/**
 * Calculate total value of items (sum of MID values)
 */
export function calculateTotalValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.valuation.estimate.mid, 0);
}

/**
 * Get value band label (Low/Mid/High) based on single value
 */
export function getValueBand(value: number): 'Low' | 'Mid' | 'High' {
  if (value < 50) return 'Low';
  if (value > 150) return 'High';
  return 'Mid';
}

/**
 * Format currency value for display
 */
export function formatValue(value: number): string {
  return `$${Math.round(value)}`;
}

/**
 * Get balancing suggestion text
 */
export function getBalancingSuggestion(diff: number): string | null {
  if (Math.abs(diff) < 25) {
    return null; // Fair enough, no suggestion needed
  }

  const absDiff = Math.abs(diff);
  if (diff > 0) {
    // Other side needs to add
    return `Ask for ~${formatValue(absDiff)} more or another small item`;
  } else {
    // Viewer needs to add
    return `Add ~${formatValue(absDiff)} or another small item`;
  }
}
