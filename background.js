chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
     chrome.sidePanel.open({ windowId: tab.windowId });
  } else {
     console.error("Cannot open side panel: Tab ID is missing.");
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'openDownloadsSettings') {
    chrome.tabs.create({ url: 'chrome://settings/downloads' });
  }
  
  if (request.type === 'downloadFile') {
    if (request.url) {
      chrome.downloads.download({
        url: request.url,
        filename: request.filename || 'download.mp4',
        conflictAction: 'uniquify'
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("[Background] Download failed:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else if (downloadId === undefined) {
           console.error("[Background] Download failed: downloadId is undefined.");
           sendResponse({ success: false, error: "Download failed: downloadId is undefined." });
        } else {
          sendResponse({ success: true, downloadId: downloadId });
        }
      });
      
      return true;
    }
    
    console.error("[Background] Invalid downloadFile message (missing url):", request);
    sendResponse({ success: false, error: "Invalid message parameters (missing url)" });
  }
});