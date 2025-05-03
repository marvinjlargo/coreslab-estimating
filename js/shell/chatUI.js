/**
 * Chat UI Module
 * Handles rendering and interaction with the chat interface
 */

import { getProjectLog, saveMessage } from '../storage.js';

/**
 * @typedef {Object} Message
 * @property {string} type - 'note' | 'tool' | 'system' | 'image'
 * @property {string} text - The message content
 * @property {number} timestamp - Unix timestamp
 * @property {boolean} [edited] - Whether the message has been edited
 * @property {string} [src] - Image source for image messages
 */

let isNearBottom = true;
let newMessagesToast = null;

/**
 * Render the chat window with messages
 * @param {Message[]} messages
 */
export function renderChat(messages) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  
  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);
  
  // Render each group
  groupedMessages.forEach(({ date, messages }) => {
    // Add date divider
    const divider = document.createElement('div');
    divider.className = 'date-divider';
    divider.textContent = formatDate(date);
    chatWindow.appendChild(divider);
    
    // Render messages
    messages.forEach(message => appendMessage(message));
  });
  
  // Scroll to bottom if near bottom
  if (isNearBottom) {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/**
 * Group messages by date
 * @param {Message[]} messages
 * @returns {Array<{date: Date, messages: Message[]}>}
 */
function groupMessagesByDate(messages) {
  const groups = new Map();
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const key = date.toDateString();
    
    if (!groups.has(key)) {
      groups.set(key, {
        date,
        messages: []
      });
    }
    
    groups.get(key).messages.push(message);
  });
  
  return Array.from(groups.values());
}

/**
 * Format date for display
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Append a message to the chat window
 * @param {Message} message
 */
export function appendMessage(message) {
  const chatWindow = document.getElementById('chat-window');
  const bubble = document.createElement('div');
  bubble.className = `bubble ${message.type}`;
  
  // Create message content
  const content = document.createElement('div');
  content.className = 'message-content';
  
  if (message.type === 'image') {
    const img = document.createElement('img');
    img.className = 'image-thumb';
    img.src = message.src;
    img.alt = 'Attached image';
    img.addEventListener('click', () => showImageModal(message.src));
    content.appendChild(img);
  } else {
    content.innerHTML = linkify(message.text);
  }
  
  // Add edit icon for note messages
  if (message.type === 'note') {
    const editIcon = document.createElement('span');
    editIcon.className = 'edit-icon';
    editIcon.textContent = '✏️';
    editIcon.addEventListener('click', () => editMessage(bubble, message));
    bubble.appendChild(editIcon);
  }
  
  // Add timestamp
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = new Date(message.timestamp).toLocaleTimeString();
  if (message.edited) {
    const edited = document.createElement('span');
    edited.className = 'message-edit';
    edited.textContent = ' (edited)';
    time.appendChild(edited);
  }
  
  bubble.appendChild(content);
  bubble.appendChild(time);
  
  // Add double-click handler for editing
  if (message.type === 'note') {
    bubble.addEventListener('dblclick', () => editMessage(bubble, message));
  }
  
  chatWindow.appendChild(bubble);
  
  // Check if we need to show new messages toast
  if (!isNearBottom) {
    showNewMessagesToast();
  } else {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/**
 * Convert URLs and file paths to links
 * @param {string} text
 * @returns {string}
 */
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)|(\/[^\s]+)/g;
  return text.replace(urlRegex, (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
}

/**
 * Edit a message
 * @param {HTMLElement} bubble
 * @param {Message} message
 */
function editMessage(bubble, message) {
  const content = bubble.querySelector('.message-content');
  const originalText = content.textContent;
  
  // Create editable textarea
  const textarea = document.createElement('textarea');
  textarea.value = originalText;
  textarea.className = 'message-edit-input';
  textarea.spellcheck = true;
  
  // Replace content with textarea
  content.innerHTML = '';
  content.appendChild(textarea);
  textarea.focus();
  
  // Handle save on Enter or blur
  const saveEdit = () => {
    const newText = textarea.value.trim();
    if (newText && newText !== originalText) {
      message.text = newText;
      message.edited = true;
      content.innerHTML = linkify(newText);
      saveMessage(getActiveProject(), message);
    } else {
      content.innerHTML = linkify(originalText);
    }
  };
  
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  });
  
  textarea.addEventListener('blur', saveEdit);
}

/**
 * Show image modal
 * @param {string} src - Image source
 */
function showImageModal(src) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('modal-image');
  const closeBtn = document.getElementById('close-modal');
  
  img.src = src;
  modal.classList.remove('hidden');
  
  closeBtn.onclick = () => modal.classList.add('hidden');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  };
}

/**
 * Show new messages toast
 */
function showNewMessagesToast() {
  if (newMessagesToast) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = '▼ New messages';
  toast.onclick = () => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
    toast.remove();
    newMessagesToast = null;
  };
  
  document.getElementById('toast-container').appendChild(toast);
  newMessagesToast = toast;
  
  setTimeout(() => {
    toast.remove();
    newMessagesToast = null;
  }, 3000);
}

/**
 * Initialize chat window scroll handling
 */
export function initChatScroll() {
  const chatWindow = document.getElementById('chat-window');
  
  chatWindow.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = chatWindow;
    isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom && newMessagesToast) {
      newMessagesToast.remove();
      newMessagesToast = null;
    }
  });
}

/**
 * Render the project header
 * @param {string} projectName
 */
export function renderProjectHeader(projectName) {
  const header = document.getElementById('project-name');
  header.textContent = projectName;
  
  // Compute HSL tint from project name hash
  const hash = projectName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash % 360);
  header.style.borderBottom = `2px solid hsl(${hue}, 70%, 50%)`;
} 