/**
 * Data Loader Module
 * 
 * This module handles loading the appropriate configuration data
 * based on the selected unit system (Imperial or Metric).
 * 
 * @author Marvin J. Largo
 */

/**
 * Loads the appropriate JSON data file based on the selected unit system.
 * 
 * @param {string} system - The unit system ('Imperial' or 'Metric')
 * @returns {Promise<Array>} A promise that resolves to an array of slab configurations
 * @throws {Error} If the data file cannot be loaded
 * 
 * @example
 * loadData('Imperial')  // loads imperial_data.json
 * loadData('Metric')    // loads metric_data.json
 */
export async function loadData(system) {
  const fileName = `data/${system.toLowerCase()}_data.json`;
  const resp = await fetch(fileName);
  if (!resp.ok) {
    throw new Error(`Failed to load ${fileName}: ${resp.status}`);
  }
  return resp.json();
}
