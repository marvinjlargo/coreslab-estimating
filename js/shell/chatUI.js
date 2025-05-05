/**
 * Chat UI Module
 * Handles rendering and interaction with the chat interface
 */

import { getProjectLog, saveMessage, getDraft, saveDraft } from '../storage.js';

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
let lastMessage = null;
let virtualizedMessages = [];
const MESSAGE_BUFFER = 100;

/**
 * Initialize chat scroll behavior
 */
export function initChatScroll() {
  const chatWindow = document.getElementById('chat-window');
  const newMessagesBtn = document.getElementById('new-messages');
  
  chatWindow.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = chatWindow;
    isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      newMessagesBtn.classList.add('hidden');
    }
    
    // Virtualized rendering
    if (virtualizedMessages.length > MESSAGE_BUFFER) {
      const visibleStart = Math.floor(scrollTop / 100);
      const visibleEnd = Math.ceil((scrollTop + clientHeight) / 100);
      
      if (visibleStart > 0) {
        const olderMessages = virtualizedMessages.slice(0, visibleStart);
        renderOlderMessages(olderMessages);
      }
    }
  });
}

/**
 * Render older messages when scrolling up
 * @param {Message[]} messages
 */
function renderOlderMessages(messages) {
  const chatWindow = document.getElementById('chat-window');
  const fragment = document.createDocumentFragment();
  
  messages.forEach(message => {
    const bubble = createMessageBubble(message);
    fragment.insertBefore(bubble, fragment.firstChild);
  });
  
  chatWindow.insertBefore(fragment, chatWindow.firstChild);
}

/**
 * Render the chat window with messages
 * @param {Message[]} messages
 */
export function renderChat(messages) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  
  // Store messages for virtualization
  virtualizedMessages = messages;
  
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
  
  // Show getting started message if empty
  if (messages.length === 0) {
    appendMessage({
      type: 'system',
      text: 'Welcome! Type a note or use the tools above to get started.',
      timestamp: Date.now()
    });
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
 * Create a message bubble element
 * @param {Message} message
 * @returns {HTMLElement}
 */
function createMessageBubble(message) {
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
  
  return bubble;
}

/**
 * Append a message to the chat window
 * @param {Message} message
 */
export function appendMessage(message) {
  const chatWindow = document.getElementById('chat-window');
  const bubble = createMessageBubble(message);
  
  chatWindow.appendChild(bubble);
  lastMessage = message;
  
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
 * Render project header with animation
 * @param {string} projectName
 */
export function renderProjectHeader(projectName) {
  const header = document.getElementById('project-name');
  const oldName = header.textContent;
  
  if (oldName !== projectName) {
    header.style.animation = 'none';
    header.offsetHeight; // Trigger reflow
    header.style.animation = 'slide-in 0.15s ease';
    header.textContent = projectName;
    
    // Set header underline color based on project name hash
    const hash = projectName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    header.style.setProperty('--accent-color', `hsl(${hue}, 70%, 50%)`);
  }
  
  // Restore draft
  const input = document.getElementById('chat-input');
  input.value = getDraft(projectName);
}

/**
 * Initialize search functionality
 */
export function initSearch() {
  const searchToggle = document.getElementById('search-toggle');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  
  searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('hidden');
    if (!searchContainer.classList.contains('hidden')) {
      searchInput.focus();
    }
  });
  
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach(bubble => {
      const text = bubble.textContent.toLowerCase();
      if (text.includes(query)) {
        bubble.classList.add('highlight');
        bubble.classList.remove('hidden');
      } else {
        bubble.classList.remove('highlight');
        bubble.classList.add('hidden');
      }
    });
  });
}

/**
 * Initialize theme toggle
 */
export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (prefersDark) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.add('light');
    themeToggle.textContent = '🌙';
  }
  
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
  });
}

/**
 * Initialize keyboard shortcuts
 */
export function initKeyboardShortcuts() {
  const input = document.getElementById('chat-input');
  
  input.addEventListener('keydown', e => {
    // Ctrl+Enter to send
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const event = new Event('keydown');
      event.key = 'Enter';
      input.dispatchEvent(event);
    }
    
    // Up arrow to load last message
    if (e.key === 'ArrowUp' && !input.value && lastMessage?.type === 'note') {
      e.preventDefault();
      input.value = lastMessage.text;
    }
  });
}

/**
 * Initialize image handling
 */
export function initImageHandling() {
  const input = document.getElementById('chat-input');
  const attachButton = document.getElementById('attach-image');
  const fileInput = document.getElementById('image-upload');
  
  // Handle paste
  input.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          handleImageFile(item.getAsFile());
        }
      }
    }
  });
  
  // Handle drop
  input.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files) {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          handleImageFile(file);
        }
      }
    }
  });
  
  // Handle file input
  attachButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      handleImageFile(file);
    }
  });
}

/**
 * Handle an image file
 * @param {File} file
 */
async function handleImageFile(file) {
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image too large (max 2MB)');
    return;
  }
  
  try {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      appendMessage({
        type: 'image',
        src,
        timestamp: Date.now()
      });
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error handling image:', error);
    showToast('Error processing image');
  }
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