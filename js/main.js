/**
 * Main Application Module
 * Bootstraps the UI and sets up event handlers
 */

import { renderTabs, switchTab } from './shell/tabManager.js';
import { renderChat } from './shell/chatUI.js';
import { handleEnter, handleTool } from './shell/inputHandler.js';
import { exportLog } from './export.js';
import { getActiveProject, getProjectLog } from './storage.js';

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  renderTabs();
  renderChat(getProjectLog(getActiveProject()));
  
  // Set up input handlers
  const input = document.getElementById('chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter(input.value);
    }
  });
  
  // Set up tool buttons
  document.getElementById('slab-tool').addEventListener('click', () => handleTool('slab'));
  
  // Set up export buttons
  document.getElementById('export-html').addEventListener('click', () => 
    exportLog('html', getActiveProject()));
  document.getElementById('export-pdf').addEventListener('click', () => 
    exportLog('pdf', getActiveProject()));
  document.getElementById('export-txt').addEventListener('click', () => 
    exportLog('txt', getActiveProject()));
});
