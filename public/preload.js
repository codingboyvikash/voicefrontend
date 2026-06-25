const { contextBridge, ipcRenderer } = require('electron');

// Auto-grant mic on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 Preload: Auto mic init');
  
  // Force mic access
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('✅ Preload mic access SUCCESS');
        window.micStream = stream;
      })
      .catch(err => {
        console.log('Preload mic fallback:', err);
      });
  }
});

// Expose to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  micReady: () => !!window.micStream
});