class BackgroundAutoReloader {
    constructor() {
        this.activeTabId = null;
        this.reloadInterval = null;
        this.reloadTimer = null;
        this.isActive = false;
        
        this.bindEvents();
    }

    bindEvents() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Listen for tab updates to stop auto reload if tab is closed or changed
        chrome.tabs.onRemoved.addListener((tabId) => {
            if (tabId === this.activeTabId) {
                this.stopAutoReload();
            }
        });

        // Listen for tab updates to handle navigation
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tabId === this.activeTabId && changeInfo.status === 'complete') {
                console.log(`Tab ${tabId} reloaded successfully`);
            }
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'startAutoReload':
                    await this.startAutoReload(request.tabId, request.interval);
                    sendResponse({ success: true });
                    break;
                    
                case 'stopAutoReload':
                    await this.stopAutoReload();
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async startAutoReload(tabId, interval) {
        try {
            // Stop any existing auto reload
            this.stopAutoReload();
            
            // Validate tab exists
            const tab = await chrome.tabs.get(tabId);
            if (!tab) {
                throw new Error('Tab not found');
            }

            this.activeTabId = tabId;
            this.reloadInterval = interval * 1000; // Convert to milliseconds
            this.isActive = true;

            // Save state to storage
            await chrome.storage.local.set({
                isActive: true,
                activeTabId: tabId,
                reloadInterval: interval
            });

            // Start the reload timer
            this.scheduleNextReload();
            
            console.log(`Auto reload started for tab ${tabId} with ${interval}s interval`);
            
        } catch (error) {
            console.error('Error starting auto reload:', error);
            throw error;
        }
    }

    async stopAutoReload() {
        try {
            // Clear the timer
            if (this.reloadTimer) {
                clearTimeout(this.reloadTimer);
                this.reloadTimer = null;
            }

            // Reset state
            this.activeTabId = null;
            this.reloadInterval = null;
            this.isActive = false;

            // Clear storage
            await chrome.storage.local.set({
                isActive: false,
                activeTabId: null
            });

            console.log('Auto reload stopped');
            
        } catch (error) {
            console.error('Error stopping auto reload:', error);
            throw error;
        }
    }

    scheduleNextReload() {
        if (!this.isActive || !this.activeTabId || !this.reloadInterval) {
            return;
        }

        this.reloadTimer = setTimeout(async () => {
            try {
                // Check if tab still exists
                const tab = await chrome.tabs.get(this.activeTabId);
                if (tab) {
                    // Reload the tab
                    await chrome.tabs.reload(this.activeTabId);
                    console.log(`Tab ${this.activeTabId} reloaded at ${new Date().toLocaleTimeString()}`);
                    
                    // Schedule next reload
                    this.scheduleNextReload();
                } else {
                    // Tab no longer exists, stop auto reload
                    this.stopAutoReload();
                }
            } catch (error) {
                console.error('Error reloading tab:', error);
                // Tab might be closed or invalid, stop auto reload
                this.stopAutoReload();
            }
        }, this.reloadInterval);
    }
}

// Initialize background script
const backgroundReloader = new BackgroundAutoReloader();

// Handle extension startup - restore state if needed
chrome.runtime.onStartup.addListener(async () => {
    try {
        const result = await chrome.storage.local.get(['isActive', 'activeTabId', 'reloadInterval']);
        if (result.isActive && result.activeTabId && result.reloadInterval) {
            // Verify tab still exists
            try {
                await chrome.tabs.get(result.activeTabId);
                // Restart auto reload
                await backgroundReloader.startAutoReload(result.activeTabId, result.reloadInterval);
            } catch (error) {
                // Tab no longer exists, clear state
                await chrome.storage.local.clear();
            }
        }
    } catch (error) {
        console.error('Error restoring state on startup:', error);
    }
});