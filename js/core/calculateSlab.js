/**
 * Slab Calculator Module
 * 
 * This module contains the core logic for finding the optimal
 * hollow-core slab configuration based on input parameters.
 * 
 * @author Marvin J. Largo
 */

import { normalize, euclidean } from './utils.js';

/**
 * Calculates the optimal slab configuration based on input parameters.
 * 
 * @param {Array} data - Array of slab configurations
 * @param {string} thickness - Selected slab thickness
 * @param {number} span - Required span length
 * @param {number} load - Required load capacity
 * @param {string} sys - Unit system ('Imperial' or 'Metric')
 * @returns {Object} Result object containing either:
 *   - Exact match configuration
 *   - Error message for overload conditions
 *   - Alternative configurations when exact match not found
 * 
 * @example
 * calculateSlab(data, "8''", 24, 120, 'Imperial')
 */
export function calculateSlab(data, thickness, span, load, sys) {
  // Normalize thickness for comparison
  const thkNorm = normalize(thickness);

  // Find exact matches that meet or exceed requirements
  const hits = data
    .filter(d => normalize(d.Thickness) === thkNorm && d.Span >= span && d.Capacity >= load)
    .sort((a,b) => a.Strands - b.Strands || a.Span - b.Span);

  // Return best exact match if found
  if (hits.length) {
    return { type: 'exact', best: hits[0] };
  }

  // Check if load exceeds maximum capacity
  const maxCap = Math.max(...data.map(d => d.Capacity));
  if (load > maxCap) {
    return {
      type: 'error',
      message: `⛔ The requested load (${load} ${sys==='Imperial'?'psf':'kPa'}) exceeds maximum (${maxCap}).`
    };
  }

  // Find closest alternative configurations
  const alts = data
    .filter(d => normalize(d.Thickness) === thkNorm)
    .map(d => ({ ...d, dist: euclidean(d.Span, d.Capacity, span, load) }))
    .sort((a,b) => a.dist - b.dist)
    .slice(0, 3);

  return { type: 'alternative', alts };
}
