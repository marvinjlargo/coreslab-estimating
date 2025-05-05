/**
 * Storage Module
 * Handles all localStorage operations for project data and chat logs
 */

/**
 * @typedef {Object} Message
 * @property {string} type - 'note' | 'tool' | 'system' | 'image'
 * @property {string} text - The message content
 * @property {number} timestamp - Unix timestamp
 * @property {boolean} [edited] - Whether the message has been edited
 * @property {string} [src] - Image source for image messages
 */

// Initialize IndexedDB for image storage
let db;
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('imageStore', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    };
  });
};

// Initialize DB on module load
initDB().catch(console.error);

/**
 * Get all project names
 * @returns {string[]}
 */
export function getAllProjects() {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  return Object.keys(data.projects);
}

/**
 * Get messages for a project
 * @param {string} name - Project name
 * @returns {Message[]}
 */
export function getProjectLog(name) {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  return data.projects[name] || [];
}

/**
 * Save a message to a project's log
 * @param {string} name - Project name
 * @param {Message} message - Message to save
 */
export function saveMessage(name, message) {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  if (!data.projects[name]) {
    data.projects[name] = [];
  }
  data.projects[name].push(message);
  localStorage.setItem('projects', JSON.stringify(data));
}

/**
 * Add a new project
 * @param {string} name - Project name
 */
export function addProject(name) {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  if (!data.projects[name]) {
    data.projects[name] = [];
  }
  localStorage.setItem('projects', JSON.stringify(data));
}

/**
 * Set the active project
 * @param {string} name - Project name
 */
export function setActiveProject(name) {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  data.activeProject = name;
  localStorage.setItem('projects', JSON.stringify(data));
}

/**
 * Get the active project name
 * @returns {string}
 */
export function getActiveProject() {
  const data = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  return data.activeProject;
}

/**
 * Save a draft for a project
 * @param {string} name - Project name
 * @param {string} draft - Draft text
 */
export function saveDraft(name, draft) {
  const data = JSON.parse(localStorage.getItem('drafts') || '{}');
  data[name] = draft;
  localStorage.setItem('drafts', JSON.stringify(data));
}

/**
 * Get a project's draft
 * @param {string} name - Project name
 * @returns {string}
 */
export function getDraft(name) {
  const data = JSON.parse(localStorage.getItem('drafts') || '{}');
  return data[name] || '';
}

/**
 * Store an image in IndexedDB
 * @param {string} id - Unique identifier for the image
 * @param {Blob} blob - Image blob
 * @returns {Promise<void>}
 */
export function storeImage(id, blob) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.put({ id, blob });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get an image from IndexedDB
 * @param {string} id - Image identifier
 * @returns {Promise<Blob>}
 */
export function getImage(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.blob);
  });
}

/**
 * Backup all data to JSON
 * @returns {string} JSON string of all data
 */
export function backupData() {
  const projects = JSON.parse(localStorage.getItem('projects') || '{"projects": {}, "activeProject": "Project A"}');
  const drafts = JSON.parse(localStorage.getItem('drafts') || '{}');
  return JSON.stringify({ projects, drafts });
}

/**
 * Restore data from JSON
 * @param {string} json - JSON string of data to restore
 */
export function restoreData(json) {
  const data = JSON.parse(json);
  localStorage.setItem('projects', JSON.stringify(data.projects));
  localStorage.setItem('drafts', JSON.stringify(data.drafts));
} 