// Background Service Worker for Smart Locator Inspector
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Locator Inspector installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject the Smart Locator Inspector
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleSmartLocatorInspector
    });
  } catch (error) {
    console.error('Failed to inject Smart Locator Inspector:', error);
  }
});

// Function to be injected into the page
function toggleSmartLocatorInspector() {
  // Check if inspector is already active
  if (window.smartLocatorInspector) {
    window.smartLocatorInspector.toggle();
  } else {
    // Initialize the inspector
    window.smartLocatorInspector = new SmartLocatorInspector();
    window.smartLocatorInspector.init();
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    // Handle clipboard operations
    navigator.clipboard.writeText(message.text).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
});