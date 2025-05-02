/**
 * Chart Drawing Module
 * 
 * This module handles the visualization of slab capacity curves
 * using the HTML5 Canvas API. It provides high-DPI rendering
 * and interactive features.
 * 
 * @author Marvin J. Largo
 */

import { normalize } from './utils.js';

/**
 * Draws a capacity curve chart for the selected slab configuration.
 * 
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Array} data - Array of slab configurations
 * @param {string} thickness - Selected slab thickness
 * @param {number} targetSpan - Target span length
 * @param {number} targetLoad - Target load capacity
 * @param {string} sys - Unit system ('Imperial' or 'Metric')
 * 
 * @example
 * drawChart(canvas, data, "8''", 24, 120, 'Imperial')
 */
export function drawChart(canvas, data, thickness, targetSpan, targetLoad, sys) {
  // Set up canvas for high-DPI rendering
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);

  // Filter and sort points by thickness
  const pts = data
    .filter(d => normalize(d.Thickness) === normalize(thickness))
    .sort((a,b) => a.Span - b.Span);

  if (!pts.length) {
    ctx.clearRect(0, 0, cssW, cssH);
    return;
  }

  // Calculate data ranges
  const xVals = pts.map(p => p.Span);
  const yVals = pts.map(p => p.Capacity);
  const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
  const yMin = Math.min(...yVals), yMax = Math.max(...yVals);

  // Set up chart dimensions
  const pad = 40, w = cssW - pad*2, h = cssH - pad*2;

  // Clear and set white background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cssW, cssH);

  // Draw grid lines
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  const xStep = Math.ceil((xMax - xMin) / 5);
  const yStep = Math.ceil((yMax - yMin) / 5);

  // Draw vertical grid lines
  for (let x = xMin; x <= xMax; x += xStep) {
    const px = pad + (x - xMin)/(xMax - xMin) * w;
    ctx.beginPath(); ctx.moveTo(px,pad); ctx.lineTo(px,pad+h); ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = yMin; y <= yMax; y += yStep) {
    const py = pad+h - (y - yMin)/(yMax - yMin)*h;
    ctx.beginPath(); ctx.moveTo(pad,py); ctx.lineTo(pad+w,py); ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(pad,pad); ctx.lineTo(pad,pad+h);
  ctx.lineTo(pad+w,pad+h); ctx.stroke();

  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  // X-axis labels
  for (let x = xMin; x <= xMax; x += xStep) {
    const px = pad + (x-xMin)/(xMax-xMin)*w;
    ctx.fillText(x, px, pad+h+15);
  }

  // Y-axis label
  ctx.save();
  ctx.translate(pad-30, pad+h/2);
  ctx.rotate(-Math.PI/2);
  ctx.textAlign = 'center';
  ctx.fillText(`Capacity (${sys==='Imperial'?'psf':'kPa'})`, 0, 0);
  ctx.restore();

  // X-axis label
  ctx.fillText(`Span (${sys==='Imperial'?'ft':'m'})`, pad+w/2, pad+h+30);

  // Draw capacity curve
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p,i) => {
    const px = pad + (p.Span-xMin)/(xMax-xMin)*w;
    const py = pad+h - (p.Capacity-yMin)/(yMax-yMin)*h;
    i ? ctx.lineTo(px,py) : ctx.moveTo(px,py);
  });
  ctx.stroke();

  // Draw data points
  pts.forEach(p => {
    const px = pad + (p.Span-xMin)/(xMax-xMin)*w;
    const py = pad+h - (p.Capacity-yMin)/(yMax-yMin)*h;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#2196F3'; ctx.stroke();
  });

  // Highlight target point if provided
  if (targetSpan && targetLoad) {
    const tx = pad + (targetSpan-xMin)/(xMax-xMin)*w;
    const ty = pad+h - (targetLoad-yMin)/(yMax-yMin)*h;
    ctx.fillStyle = '#FF5722';
    ctx.beginPath(); ctx.arc(tx,ty,5,0,Math.PI*2); ctx.fill();
  }
}
