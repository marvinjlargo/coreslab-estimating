/**
 * Main Application Module
 * 
 * This module serves as the entry point for the application,
 * handling user interactions, data processing, and UI updates.
 * 
 * @author Marvin J. Largo
 */

import { evaluateExpression } from './core/evaluateExpression.js';
import { calculateSlab } from './core/calculateSlab.js';
import { drawChart } from './core/drawChart.js';
import { normalize, formatResult } from './core/utils.js';
import { loadData } from './core/dataLoader.js';

/**
 * Initializes the application when the DOM is loaded.
 * Sets up event listeners and initial UI state.
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM element references
  const systemEl   = document.getElementById('system');
  const spanEl     = document.getElementById('span');
  const loadEl     = document.getElementById('load');
  const thkEl      = document.getElementById('thickness');
  const spanUnit   = document.getElementById('span-unit');
  const loadUnit   = document.getElementById('load-unit');

  const exactResultEl     = document.getElementById('exact-result');
  const fallbackResultsEl = document.getElementById('fallback-results');
  const fallbackTableBody = document.querySelector('#fallback-table tbody');
  const chartCanvas       = document.getElementById('capacity-chart');

  const calcBtn     = document.getElementById('calc-btn');
  const copyBtn     = document.getElementById('copy-result');
  const downloadBtn = document.getElementById('download-result');

  /**
   * Populates the thickness dropdown with options based on the selected unit system.
   * 
   * @param {string} sys - The unit system ('Imperial' or 'Metric')
   */
  function populateThickness(sys) {
    thkEl.innerHTML = '';
    const opts = sys === 'Imperial'
      ? ["8''", "10''", "12''", "14''"]
      : ['200 mm', '250 mm', '300 mm', '350 mm'];
    opts.forEach(t => {
      const o = document.createElement('option');
      o.value = o.textContent = t;
      thkEl.append(o);
    });
  }
  populateThickness(systemEl.value);

  /**
   * Handles unit system changes, updating UI elements accordingly.
   */
  systemEl.addEventListener('change', () => {
    const sys = systemEl.value;
    spanUnit.textContent = sys === 'Imperial' ? '(ft)' : '(m)';
    loadUnit.textContent = sys === 'Imperial' ? '(psf)' : '(kPa)';
    spanEl.placeholder = sys === 'Imperial' ? 'e.g. 24' : 'e.g. 7.3';
    loadEl.placeholder = sys === 'Imperial' ? 'e.g. 120' : 'e.g. 5';
    exactResultEl.textContent = '';
    fallbackResultsEl.style.display = 'none';
    fallbackTableBody.innerHTML = '';
    populateThickness(sys);
  });

  /**
   * Handles the calculation process when the calculate button is clicked.
   */
  calcBtn.addEventListener('click', async () => {
    const sys = systemEl.value;

    // Parse arithmetic expressions from user input
    const spanVal = evaluateExpression(spanEl.value);
    const loadVal = evaluateExpression(loadEl.value);

    // Validate input
    if (isNaN(spanVal) || isNaN(loadVal) || !thkEl.value.trim()) {
      exactResultEl.textContent = '⛔ Enter span, load and thickness.';
      fallbackResultsEl.style.display = 'none';
      fallbackTableBody.innerHTML = '';
      return;
    }

    // Update input fields with parsed values
    spanEl.value = Number.isInteger(spanVal) ? spanVal : Number(spanVal.toFixed(2));
    loadEl.value = Number.isInteger(loadVal) ? loadVal : Number(loadVal.toFixed(2));

    // Load configuration data
    let data;
    try {
      data = await loadData(sys);
    } catch {
      exactResultEl.textContent = '⚠️ Could not load data file.';
      fallbackResultsEl.style.display = 'none';
      fallbackTableBody.innerHTML = '';
      return;
    }

    // Calculate optimal configuration
    const result = calculateSlab(data, thkEl.value, spanVal, loadVal, sys);

    if (result.type === 'exact') {
      const { Strands, Capacity, Span } = result.best;
      const formattedCapacity = Number.isInteger(Capacity) ? Capacity : Capacity.toFixed(2);
      const formattedSpan = Number.isInteger(Span) ? Span : Span.toFixed(2);
      exactResultEl.innerHTML = `
        ✅ <strong>${Strands}</strong> strands<br>
        Capacity <strong>${formattedCapacity} ${sys === 'Imperial' ? 'psf' : 'kPa'}</strong>
        at ${formattedSpan} ${sys === 'Imperial' ? 'ft' : 'm'}`;
      fallbackResultsEl.style.display = 'none';
      fallbackTableBody.innerHTML = '';
    }
    else if (result.type === 'error') {
      exactResultEl.textContent = result.message;
      fallbackResultsEl.style.display = 'none';
      fallbackTableBody.innerHTML = '';
    }
    else {
      // Show alternative configurations
      exactResultEl.textContent = 'No exact configuration found. Closest:';
      fallbackTableBody.innerHTML = result.alts.map(a => {
        const formattedCapacity = Number.isInteger(a.Capacity) ? a.Capacity : a.Capacity.toFixed(2);
        const formattedSpan = Number.isInteger(a.Span) ? a.Span : a.Span.toFixed(2);
        return `
        <tr>
          <td>${a.Strands}</td>
          <td>${formattedSpan} ${sys === 'Imperial' ? 'ft' : 'm'}</td>
          <td>${formattedCapacity} ${sys === 'Imperial' ? 'psf' : 'kPa'}</td>
        </tr>
      `}).join('');
      fallbackResultsEl.style.display = 'block';
    }

    // Draw the capacity curve chart
    drawChart(chartCanvas, data, thkEl.value, spanVal, loadVal, sys);
  });

  /**
   * Copies the calculation result to the clipboard.
   */
  copyBtn.addEventListener('click', () => {
    if (exactResultEl.innerText) {
      navigator.clipboard.writeText(exactResultEl.innerText);
    }
  });

  /**
   * Downloads the calculation result as a text file.
   */
  downloadBtn.addEventListener('click', () => {
    if (!exactResultEl.innerText) return;
    const blob = new Blob([exactResultEl.innerText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'slab_calculation.txt';
    a.click();
  });

  /**
   * Handles the Enter key to trigger calculation.
   */
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calcBtn.click();
    }
  });
});
