/**
 * Main Module
 * Bootstraps the UI and sets up event handlers
 */

import { renderTabs, switchTab, initTabManager } from './shell/tabManager.js';
import { renderChat, renderProjectHeader, initChatScroll, initSearch, initTheme, initKeyboardShortcuts, initImageHandling, appendMessage } from './shell/chatUI.js';
import { handleEnter, handleTool, initInputHandling } from './shell/inputHandler.js';
import { exportLog } from './export.js';
import { getActiveProject, getProjectLog, saveMessage, backupData, restoreData } from './storage.js';

// Initialize the app
function init() {
  // Initialize tab manager
  initTabManager();
  
  // Render UI
  renderTabs();
  renderProjectHeader(getActiveProject());
  renderChat(getProjectLog(getActiveProject()));
  
  // Initialize features
  initChatScroll();
  initSearch();
  initTheme();
  initKeyboardShortcuts();
  initImageHandling();
  initInputHandling();
  
  // Set up event listeners
  const input = document.getElementById('chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleEnter(input.value);
    }
  });
  
  // Tool buttons
  document.getElementById('slab-tool').addEventListener('click', () => handleTool('slab'));
  document.getElementById('export-html').addEventListener('click', () => {
    exportLog('html', getActiveProject());
    showToast('📄 Export ready – check your downloads');
  });
  document.getElementById('export-pdf').addEventListener('click', () => {
    exportLog('pdf', getActiveProject());
    showToast('📄 Export ready – check your downloads');
  });
  document.getElementById('export-txt').addEventListener('click', () => {
    exportLog('txt', getActiveProject());
    showToast('📄 Export ready – check your downloads');
  });
  
  // Backup/Restore
  document.getElementById('backup-json').addEventListener('click', () => {
    const data = backupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Backup saved');
  });
  
  document.getElementById('restore-json').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            restoreData(e.target.result);
            renderChat(getProjectLog(getActiveProject()));
            showToast('🔄 Data restored');
          } catch (error) {
            console.error('Error restoring data:', error);
            showToast('❌ Error restoring data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });
}

/**
 * Show a toast message
 * @param {string} message
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  document.getElementById('toast-container').appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Start the app
init();
