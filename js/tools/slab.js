/**
 * Slab Tool Module
 * Refactored version of the original slab calculator
 */

import { evaluateExpression } from '../core/evaluateExpression.js';
import { calculateSlab } from '../core/calculateSlab.js';
import { drawChart } from '../core/drawChart.js';
import { loadData } from '../core/dataLoader.js';

/**
 * Open the slab calculator tool
 * @returns {Promise<string>} - Formatted result string
 */
export async function openSlabTool() {
  return new Promise((resolve) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Hollow-Core Slab Calculator</h2>
          <button class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="system">Unit System</label>
            <select id="system">
              <option value="Imperial">Imperial (ft / psf)</option>
              <option value="Metric">Metric (m / kPa)</option>
            </select>

            <label for="span">Span <span id="span-unit">(ft)</span></label>
            <input id="span" type="text" inputmode="decimal" placeholder="e.g. 24 or 24+4" />

            <label for="load">Superimposed Load <span id="load-unit">(psf)</span></label>
            <input id="load" type="text" inputmode="decimal" placeholder="e.g. 120 or 100*1.2" />

            <label for="thickness">Slab Thickness</label>
            <select id="thickness"></select>

            <button id="calc-btn">Calculate</button>
          </div>

          <div id="result" class="result">
            <div id="exact-result"></div>
            <div id="fallback-results" class="fallback-results">
              <h3>Alternative Configurations</h3>
              <table id="fallback-table">
                <thead>
                  <tr><th>Strands</th><th>Span</th><th>Capacity</th></tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            <div id="chart-container" class="chart-container">
              <canvas id="capacity-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(modal);

    // Get references to elements
    const systemEl = modal.querySelector('#system');
    const spanEl = modal.querySelector('#span');
    const loadEl = modal.querySelector('#load');
    const thkEl = modal.querySelector('#thickness');
    const spanUnit = modal.querySelector('#span-unit');
    const loadUnit = modal.querySelector('#load-unit');
    const exactResultEl = modal.querySelector('#exact-result');
    const fallbackResultsEl = modal.querySelector('#fallback-results');
    const fallbackTableBody = modal.querySelector('#fallback-table tbody');
    const chartCanvas = modal.querySelector('#capacity-chart');
    const calcBtn = modal.querySelector('#calc-btn');
    const closeBtn = modal.querySelector('.close-btn');

    // Populate thickness options
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

    // Handle unit system changes
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

    // Handle calculation
    calcBtn.addEventListener('click', async () => {
      const sys = systemEl.value;
      const spanVal = evaluateExpression(spanEl.value);
      const loadVal = evaluateExpression(loadEl.value);

      if (isNaN(spanVal) || isNaN(loadVal) || !thkEl.value.trim()) {
        exactResultEl.textContent = '⛔ Enter span, load and thickness.';
        fallbackResultsEl.style.display = 'none';
        fallbackTableBody.innerHTML = '';
        return;
      }

      spanEl.value = Number.isInteger(spanVal) ? spanVal : Number(spanVal.toFixed(2));
      loadEl.value = Number.isInteger(loadVal) ? loadVal : Number(loadVal.toFixed(2));

      let data;
      try {
        data = await loadData(sys);
      } catch {
        exactResultEl.textContent = '⚠️ Could not load data file.';
        fallbackResultsEl.style.display = 'none';
        fallbackTableBody.innerHTML = '';
        return;
      }

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

      drawChart(chartCanvas, data, thkEl.value, spanVal, loadVal, sys);
    });

    // Handle close
    closeBtn.addEventListener('click', () => {
      const result = exactResultEl.textContent;
      document.body.removeChild(modal);
      resolve(result);
    });

    // Handle Enter key
    modal.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calcBtn.click();
      }
    });
  });
} 