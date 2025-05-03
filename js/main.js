/**
 * Main Module
 * Bootstraps the UI and sets up event handlers
 */

import { renderTabs, switchTab } from './shell/tabManager.js';
import { renderChat, renderProjectHeader } from './shell/chatUI.js';
import { handleEnter, handleTool } from './shell/inputHandler.js';
import { exportLog } from './export.js';
import { getActiveProject, getProjectLog } from './storage.js';

// Initialize the app
function init() {
  // Render UI
  renderTabs();
  renderProjectHeader(getActiveProject());
  renderChat(getProjectLog(getActiveProject()));
  
  // Set up event listeners
  const input = document.getElementById('chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter(input.value);
    }
  });
  
  // Tool buttons
  document.getElementById('slab-tool').addEventListener('click', () => handleTool('slab'));
  document.getElementById('export-html').addEventListener('click', () => exportLog('html', getActiveProject()));
  document.getElementById('export-pdf').addEventListener('click', () => exportLog('pdf', getActiveProject()));
  document.getElementById('export-txt').addEventListener('click', () => exportLog('txt', getActiveProject()));
}

// Start the app
init();
