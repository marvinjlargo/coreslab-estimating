/**
 * Tab Manager Module
 * Handles project tabs and tab switching
 */

import { getAllProjects, setActiveProject, addProject, getActiveProject } from '../storage.js';
import { renderChat, renderProjectHeader } from './chatUI.js';
import { getProjectLog } from '../storage.js';

/**
 * Initialize tab manager
 */
export function initTabManager() {
  // Create initial project if none exists
  if (getAllProjects().length === 0) {
    addProject('New Project');
  }
  
  // Set up tab bar
  renderTabs();
}

/**
 * Render all project tabs
 */
export function renderTabs() {
  const tabBar = document.getElementById('tab-bar');
  const projects = getAllProjects();
  const activeProject = getActiveProject();
  
  tabBar.innerHTML = projects.map(name => `
    <div class="tab ${name === activeProject ? 'active' : ''}" data-project="${name}">
      ${name}
    </div>
  `).join('') + '<div class="tab new-tab">+</div>';
  
  // Add event listeners
  document.querySelectorAll('.tab:not(.new-tab)').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.project));
  });
  
  document.querySelector('.new-tab').addEventListener('click', () => {
    const name = prompt('Enter project name:');
    if (name) {
      addProject(name);
      switchTab(name);
    }
  });
}

/**
 * Switch to a different project tab
 * @param {string} name - Project name
 */
export function switchTab(name) {
  setActiveProject(name);
  renderTabs();
  renderProjectHeader(name);
  renderChat(getProjectLog(name));
} 