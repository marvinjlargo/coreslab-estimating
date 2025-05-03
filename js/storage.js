/**
 * Storage Module
 * Handles all localStorage operations for project data and chat logs
 */

/**
 * @typedef {Object} Message
 * @property {string} type - 'note' | 'tool' | 'system'
 * @property {string} text - The message content
 * @property {number} timestamp - Unix timestamp
 */

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