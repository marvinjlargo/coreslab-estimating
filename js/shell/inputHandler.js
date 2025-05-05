/**
 * Input Handler Module
 * Handles user input and tool interactions
 */

import { saveMessage, saveDraft, getActiveProject } from '../storage.js';
import { appendMessage } from './chatUI.js';
import { openSlabTool } from '../tools/slab.js';

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
      type: 'note',
      text: trimmedText,
      timestamp: Date.now()
    };
    
    saveMessage(getActiveProject(), message);
    appendMessage(message);
    
    // Clear input and save empty draft
    input.value = '';
    saveDraft(getActiveProject(), '');
  }
}

/**
 * Handle tool button click
 * @param {string} tool - Tool name
 */
export async function handleTool(tool) {
  if (tool === 'slab') {
    const result = await openSlabTool();
    if (result) {
      const msg = { type: 'tool', text: result, timestamp: Date.now() };
      saveMessage(getActiveProject(), msg);
      appendMessage(msg);
    }
  }
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
  });
} 