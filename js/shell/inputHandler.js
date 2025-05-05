/**
 * Input Handler Module
 * Handles user input and tool interactions
 */

import { saveMessage, saveDraft } from '../storage.js';
import { appendMessage } from './chatUI.js';

let currentTool = null;

/**
 * Handle Enter key press
 * @param {string} text - Input text
 */
export function handleEnter(text) {
  const input = document.getElementById('chat-input');
  const trimmedText = text.trim();
  
  if (trimmedText) {
    // Save message
    const message = {
      type: currentTool || 'note',
      text: trimmedText,
      timestamp: Date.now()
    };
    
    saveMessage(getActiveProject(), message);
    appendMessage(message);
    
    // Clear input and save empty draft
    input.value = '';
    saveDraft(getActiveProject(), '');
    
    // Reset tool
    if (currentTool) {
      currentTool = null;
      input.placeholder = 'Type a note or click a tool...';
    }
  }
}

/**
 * Handle tool button click
 * @param {string} tool - Tool name
 */
export function handleTool(tool) {
  const input = document.getElementById('chat-input');
  
  if (currentTool === tool) {
    // Toggle off
    currentTool = null;
    input.placeholder = 'Type a note or click a tool...';
  } else {
    // Toggle on
    currentTool = tool;
    input.placeholder = `Using ${tool} tool...`;
  }
  
  input.focus();
}

/**
 * Initialize input handling
 */
export function initInputHandling() {
  const input = document.getElementById('chat-input');
  
  // Save draft on input
  input.addEventListener('input', () => {
    saveDraft(getActiveProject(), input.value);
  });
  
  // Handle keyboard shortcuts
  input.addEventListener('keydown', e => {
    // Ctrl+Enter to send
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleEnter(input.value);
    }
    
    // Escape to clear tool
    if (e.key === 'Escape' && currentTool) {
      currentTool = null;
      input.placeholder = 'Type a note or click a tool...';
    }
  });
}

/**
 * Get the active project name
 * @returns {string}
 */
function getActiveProject() {
  return document.getElementById('project-name').textContent;
} 