/**
 * Chat UI Module
 * Handles rendering of chat messages and the chat window
 */

import { getActiveProject, saveMessage } from '../storage.js';

/**
 * @typedef {Object} Message
 * @property {string} type - 'note' | 'tool' | 'system'
 * @property {string} text - The message content
 * @property {number} timestamp - Unix timestamp
 * @property {boolean} [edited] - Whether the message has been edited
 */

/**
 * Render the chat window with messages
 * @param {Message[]} messages - Array of messages to display
 */
export function renderChat(messages) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  messages.forEach(message => appendMessage(message));
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Append a single message to the chat window
 * @param {Message} message - Message to append
 */
export function appendMessage(message) {
  const chatWindow = document.getElementById('chat-window');
  const bubble = document.createElement('div');
  bubble.className = `bubble ${message.type}`;
  
  const time = new Date(message.timestamp).toLocaleTimeString();
  bubble.innerHTML = `
    <div class="message-content">${message.text}</div>
    <div class="message-time">${time}${message.edited ? ' <span class="message-edit">(edited)</span>' : ''}</div>
  `;
  
  // Add double-click handler for editing
  if (message.type === 'note') {
    bubble.addEventListener('dblclick', () => editMessage(bubble, message));
  }
  
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Edit a message
 * @param {HTMLElement} bubble - Message bubble element
 * @param {Message} message - Message object
 */
function editMessage(bubble, message) {
  const content = bubble.querySelector('.message-content');
  const originalText = content.textContent;
  
  // Create editable input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.className = 'message-edit-input';
  input.spellcheck = true;
  
  // Replace content with input
  content.innerHTML = '';
  content.appendChild(input);
  input.focus();
  
  // Handle save on Enter or blur
  const saveEdit = () => {
    const newText = input.value.trim();
    if (newText && newText !== originalText) {
      message.text = newText;
      message.edited = true;
      saveMessage(getActiveProject(), message);
      renderChat(getProjectLog(getActiveProject()));
    } else {
      content.textContent = originalText;
    }
  };
  
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      content.textContent = originalText;
    }
  });
  
  input.addEventListener('blur', saveEdit);
}

/**
 * Render the project header
 * @param {string} projectName - Name of the active project
 */
export function renderProjectHeader(projectName) {
  const header = document.getElementById('project-header');
  header.textContent = projectName;
} 