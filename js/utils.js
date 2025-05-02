/**
 * Utility Functions Module
 * 
 * This module provides helper functions used throughout the application
 * for data normalization, distance calculations, and result formatting.
 * 
 * @author Marvin J. Largo
 */

/**
 * Normalizes a string by trimming whitespace, converting to lowercase,
 * and standardizing internal whitespace.
 * 
 * @param {string} str - The string to normalize
 * @returns {string} The normalized string
 * 
 * @example
 * normalize(" 8'' ")  // returns "8''"
 * normalize("200 mm") // returns "200 mm"
 */
export function normalize(str) {
  return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculates the Euclidean distance between two points in 2D space.
 * Used to find the closest alternative configurations when an exact match is not found.
 * 
 * @param {number} x1 - First point's x-coordinate
 * @param {number} y1 - First point's y-coordinate
 * @param {number} x2 - Second point's x-coordinate
 * @param {number} y2 - Second point's y-coordinate
 * @returns {number} The Euclidean distance between the points
 * 
 * @example
 * euclidean(24, 120, 25, 125)  // returns ~5.385
 */
export function euclidean(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * Formats calculation results into a readable text block.
 * 
 * @param {string} sys - The unit system ('Imperial' or 'Metric')
 * @param {number} span - The span length
 * @param {number} load - The superimposed load
 * @param {string} thickness - The slab thickness
 * @param {number} strands - The number of strands
 * @param {number} capacity - The load capacity
 * @returns {string} A formatted text block with all calculation results
 * 
 * @example
 * formatResult('Imperial', 24, 120, "8''", 7, 150)
 */
export function formatResult(sys, span, load, thickness, strands, capacity) {
  return `
Hollow-Core Slab Calculation
System      : ${sys}
Span        : ${span} ${sys === 'Imperial' ? 'ft' : 'm'}
Superimposed: ${load} ${sys === 'Imperial' ? 'psf' : 'kPa'}
Thickness   : ${thickness}
Strands req.: ${strands}
Capacity    : ${capacity} ${sys === 'Imperial' ? 'psf' : 'kPa'}
`.trim();
}
