/**
 * Input Handler Module
 * Manages user input and tool interactions
 */

import { getActiveProject, saveMessage } from '../storage.js';
import { appendMessage } from './chatUI.js';
import { openSlabTool } from '../tools/slab.js';

/**
 * Handle Enter key press in the input field
 * @param {string} text - Input text
 */
export function handleEnter(text) {
  if (!text.trim()) return;
  
  const message = {
    type: 'note',
    text: text,
    timestamp: Date.now()
  };
  
  const project = getActiveProject();
  saveMessage(project, message);
  appendMessage(message);
  
  // Clear input
  document.getElementById('chat-input').value = '';
}

/**
 * Handle tool button clicks
 * @param {string} toolName - Name of the tool to open
 */
export async function handleTool(toolName) {
  let result;
  
  switch (toolName) {
    case 'slab':
      result = await openSlabTool();
      break;
    // Add more tools here
  }
  
  if (result) {
    const message = {
      type: 'tool',
      text: result,
      timestamp: Date.now()
    };
    
    const project = getActiveProject();
    saveMessage(project, message);
    appendMessage(message);
  }
} 