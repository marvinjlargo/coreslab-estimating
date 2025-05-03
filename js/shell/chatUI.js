/**
 * Chat UI Module
 * Handles rendering of chat messages and the chat window
 */

/**
 * @typedef {Object} Message
 * @property {string} type - 'note' | 'tool' | 'system'
 * @property {string} text - The message content
 * @property {number} timestamp - Unix timestamp
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
    <div class="message-time">${time}</div>
  `;
  
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
} 