/**
 * Export Module
 * Handles exporting chat logs in various formats
 */

import { getProjectLog } from './storage.js';

/**
 * Export chat log in specified format
 * @param {string} format - 'html' | 'pdf' | 'txt'
 * @param {string} projectName - Name of project to export
 */
export async function exportLog(format, projectName) {
  const messages = getProjectLog(projectName);
  
  switch (format) {
    case 'html':
      exportHTML(messages, projectName);
      break;
    case 'pdf':
      await exportPDF(messages, projectName);
      break;
    case 'txt':
      exportTXT(messages, projectName);
      break;
  }
}

/**
 * Export as HTML and open print dialog
 * @param {Message[]} messages - Messages to export
 * @param {string} projectName - Project name
 */
function exportHTML(messages, projectName) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${projectName} - Chat Log</title>
        <style>
          body { font-family: sans-serif; margin: 2em; }
          .bubble { margin: 1em; padding: 1em; border-radius: 1em; }
          .note { background: #e3f2fd; }
          .tool { background: #e8f5e9; }
          .system { background: #f5f5f5; }
          .time { font-size: 0.8em; color: #666; }
        </style>
      </head>
      <body>
        <h1>${projectName}</h1>
        ${messages.map(m => `
          <div class="bubble ${m.type}">
            <div class="content">${m.text}</div>
            <div class="time">${new Date(m.timestamp).toLocaleString()}</div>
          </div>
        `).join('')}
      </body>
    </html>
  `;
  
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

/**
 * Export as PDF using jsPDF
 * @param {Message[]} messages - Messages to export
 * @param {string} projectName - Project name
 */
async function exportPDF(messages, projectName) {
  // Load jsPDF dynamically
  const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(projectName, 20, 20);
  
  doc.setFontSize(12);
  let y = 40;
  messages.forEach(m => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(10);
    doc.text(new Date(m.timestamp).toLocaleString(), 20, y);
    y += 5;
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(m.text, 170);
    doc.text(lines, 20, y);
    y += lines.length * 7 + 10;
  });
  
  doc.save(`${projectName}.pdf`);
}

/**
 * Export as plain text
 * @param {Message[]} messages - Messages to export
 * @param {string} projectName - Project name
 */
function exportTXT(messages, projectName) {
  const text = messages.map(m => 
    `${new Date(m.timestamp).toLocaleString()}\n${m.text}\n\n`
  ).join('');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${projectName}.txt`;
  a.click();
} 