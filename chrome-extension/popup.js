// Popup script for Smart Locator Inspector
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-inspector');
  const helpBtn = document.getElementById('open-help');
  const settingsBtn = document.getElementById('open-settings');
  const statusDiv = document.getElementById('status');
  
  // Check current inspector status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_STATUS' }, (response) => {
        if (response && response.active) {
          updateStatus(true);
        }
      });
    }
  });
  
  // Toggle inspector
  toggleBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' }, (response) => {
          if (response) {
            updateStatus(response.active);
          }
        });
      }
    });
  });
  
  // Help button
  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/sangle-agest/capture_locator_tool#readme'
    });
  });
  
  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_SETTINGS' });
      }
    });
  });
  
  function updateStatus(isActive) {
    if (isActive) {
      statusDiv.textContent = 'Inspector: Active ✅';
      statusDiv.className = 'status active';
      toggleBtn.textContent = '⏹️ Deactivate Inspector';
    } else {
      statusDiv.textContent = 'Inspector: Inactive ❌';
      statusDiv.className = 'status inactive';
      toggleBtn.textContent = '🚀 Activate Inspector';
    }
  }
});