/**
 * Slab Tool Module
 * Refactored version of the original slab calculator
 */

import { evaluateExpression } from '../core/evaluateExpression.js';
import { calculateSlab } from '../core/calculateSlab.js';
import { drawChart } from '../core/drawChart.js';
import { loadData } from '../core/dataLoader.js';

// Form state persistence
const STORAGE_KEY = 'slab-calculator-state';

function saveFormState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadFormState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Open the slab calculator tool
 * @returns {Promise<string>} - Formatted result string
 */
export async function openSlabTool() {
  return new Promise((resolve) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'slab-calculator-title');
    modal.innerHTML = `
      <div class="modal-content slab-calculator">
        <div class="modal-header">
          <h2 id="slab-calculator-title">Hollow-Core Slab Calculator</h2>
          <button class="close-btn" aria-label="Close calculator">×</button>
        </div>
        <div class="modal-body">
          <form id="slab-form" class="slab-form" novalidate>
            <div class="form-group">
              <label for="system">Unit System</label>
              <select id="system" required aria-required="true">
                <option value="Imperial">Imperial (ft / psf)</option>
                <option value="Metric">Metric (m / kPa)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="span">Span <span id="span-unit">(ft)</span></label>
              <input 
                id="span" 
                type="text" 
                inputmode="decimal" 
                placeholder="e.g. 24 or 24+4"
                required
                aria-required="true"
                aria-invalid="false"
              />
              <div class="error-message" id="span-error"></div>
            </div>

            <div class="form-group">
              <label for="load">Superimposed Load <span id="load-unit">(psf)</span></label>
              <input 
                id="load" 
                type="text" 
                inputmode="decimal" 
                placeholder="e.g. 120 or 100*1.2"
                required
                aria-required="true"
                aria-invalid="false"
              />
              <div class="error-message" id="load-error"></div>
            </div>

            <div class="form-group">
              <label for="thickness">Slab Thickness</label>
              <select 
                id="thickness" 
                required
                aria-required="true"
              ></select>
              <div class="error-message" id="thickness-error"></div>
            </div>

            <button 
              type="submit" 
              id="calc-btn" 
              class="primary-button"
              aria-label="Calculate slab configuration"
            >
              Calculate
            </button>
          </form>

          <div id="result" class="result" aria-live="polite">
            <div id="exact-result"></div>
            <div id="fallback-results" class="fallback-results">
              <h3>Alternative Configurations</h3>
              <table id="fallback-table" aria-label="Alternative slab configurations">
                <thead>
                  <tr>
                    <th scope="col">Strands</th>
                    <th scope="col">Span</th>
                    <th scope="col">Capacity</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            <div id="chart-container" class="chart-container">
              <canvas id="capacity-chart" aria-label="Capacity chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(modal);

    // Get references to elements
    const form = modal.querySelector('#slab-form');
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
    const closeBtn = modal.querySelector('.close-btn');

    // Load saved state
    const savedState = loadFormState();
    if (savedState.system) {
      systemEl.value = savedState.system;
      spanEl.value = savedState.span || '';
      loadEl.value = savedState.load || '';
    }

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
      if (savedState.thickness && opts.includes(savedState.thickness)) {
        thkEl.value = savedState.thickness;
      }
    }
    populateThickness(systemEl.value);

    // Form validation
    function validateInput(input, errorEl) {
      const value = input.value.trim();
      const isValid = value && !isNaN(evaluateExpression(value));
      
      input.setAttribute('aria-invalid', !isValid);
      errorEl.textContent = isValid ? '' : 'Please enter a valid number or expression';
      
      return isValid;
    }

    function validateForm() {
      const isSpanValid = validateInput(spanEl, modal.querySelector('#span-error'));
      const isLoadValid = validateInput(loadEl, modal.querySelector('#load-error'));
      const isThicknessValid = thkEl.value.trim() !== '';
      
      thkEl.setAttribute('aria-invalid', !isThicknessValid);
      modal.querySelector('#thickness-error').textContent = 
        isThicknessValid ? '' : 'Please select a thickness';
      
      return isSpanValid && isLoadValid && isThicknessValid;
    }

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
      
      // Save state
      saveFormState({
        system: sys,
        span: spanEl.value,
        load: loadEl.value,
        thickness: thkEl.value
      });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      const sys = systemEl.value;
      const spanVal = evaluateExpression(spanEl.value);
      const loadVal = evaluateExpression(loadEl.value);

      // Format values
      spanEl.value = Number.isInteger(spanVal) ? spanVal : Number(spanVal.toFixed(2));
      loadEl.value = Number.isInteger(loadVal) ? loadVal : Number(loadVal.toFixed(2));

      // Save state
      saveFormState({
        system: sys,
        span: spanEl.value,
        load: loadEl.value,
        thickness: thkEl.value
      });

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

    // Handle input validation
    [spanEl, loadEl].forEach(input => {
      input.addEventListener('input', () => {
        validateInput(input, modal.querySelector(`#${input.id}-error`));
      });
    });

    thkEl.addEventListener('change', () => {
      validateForm();
    });

    // Handle close
    closeBtn.addEventListener('click', () => {
      const result = exactResultEl.textContent;
      document.body.removeChild(modal);
      resolve(result);
    });

    // Handle Escape key
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeBtn.click();
      }
    });

    // Focus first input
    spanEl.focus();
  });
} 