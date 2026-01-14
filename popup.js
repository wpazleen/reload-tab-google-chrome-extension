class TabAutoReloader {
    constructor() {
        this.isActive = false;
        this.currentTabId = null;
        this.reloadInterval = 10;
        this.countdownTimer = null;
        this.remainingTime = 0;
        
        this.initializeElements();
        this.loadCurrentTab();
        this.loadSettings();
        this.bindEvents();
        this.bindTabEvents();
        this.bindLinkEvents();
        this.checkActiveStatus();
    }

    initializeElements() {
        this.elements = {
            currentTabTitle: document.getElementById('currentTabTitle'),
            currentTabUrl: document.getElementById('currentTabUrl'),
            reloadTime: document.getElementById('reloadTime'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            nextReload: document.getElementById('nextReload'),
            countdown: document.getElementById('countdown')
        };
    }

    async loadCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                this.currentTabId = tab.id;
                this.elements.currentTabTitle.textContent = tab.title || 'Untitled';
                this.elements.currentTabUrl.textContent = tab.url || '';
            }
        } catch (error) {
            console.error('Error loading current tab:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['reloadInterval']);
            if (result.reloadInterval) {
                this.reloadInterval = result.reloadInterval;
                this.elements.reloadTime.value = this.reloadInterval;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({
                reloadInterval: this.reloadInterval
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    bindEvents() {
        this.elements.reloadTime.addEventListener('change', (e) => {
            this.reloadInterval = parseInt(e.target.value);
            this.saveSettings();
        });

        this.elements.startBtn.addEventListener('click', () => {
            this.startAutoReload();
        });

        this.elements.stopBtn.addEventListener('click', () => {
            this.stopAutoReload();
        });
    }

    async checkActiveStatus() {
        try {
            const result = await chrome.storage.local.get(['isActive', 'activeTabId']);
            if (result.isActive && result.activeTabId === this.currentTabId) {
                this.updateUIForActiveState();
                this.startCountdown();
            }
        } catch (error) {
            console.error('Error checking active status:', error);
        }
    }

    async startAutoReload() {
        if (!this.currentTabId) {
            alert('No active tab found!');
            return;
        }

        try {
            // Send message to background script to start auto reload
            await chrome.runtime.sendMessage({
                action: 'startAutoReload',
                tabId: this.currentTabId,
                interval: this.reloadInterval
            });

            this.updateUIForActiveState();
            this.startCountdown();
            
        } catch (error) {
            console.error('Error starting auto reload:', error);
            alert('Failed to start auto reload. Please try again.');
        }
    }

    async stopAutoReload() {
        try {
            await chrome.runtime.sendMessage({
                action: 'stopAutoReload'
            });

            this.updateUIForInactiveState();
            this.stopCountdown();
            
        } catch (error) {
            console.error('Error stopping auto reload:', error);
        }
    }

    updateUIForActiveState() {
        this.isActive = true;
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.elements.reloadTime.disabled = true;
        
        const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
        statusDot.classList.add('active');
        this.elements.statusText.textContent = 'Active';
        this.elements.nextReload.style.display = 'block';
    }

    updateUIForInactiveState() {
        this.isActive = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.reloadTime.disabled = false;
        
        const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
        statusDot.classList.remove('active');
        this.elements.statusText.textContent = 'Inactive';
        this.elements.nextReload.style.display = 'none';
    }

    startCountdown() {
        this.remainingTime = this.reloadInterval;
        this.updateCountdown();
        
        this.countdownTimer = setInterval(() => {
            this.remainingTime--;
            this.updateCountdown();
            
            if (this.remainingTime <= 0) {
                this.remainingTime = this.reloadInterval;
            }
        }, 1000);
    }

    stopCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    updateCountdown() {
        this.elements.countdown.textContent = this.remainingTime;
    }

    bindTabEvents() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    bindLinkEvents() {
        const linkCards = document.querySelectorAll('.link-card');
        
        linkCards.forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url');
                if (url) {
                    // Open link in new tab
                    chrome.tabs.create({ url: url });
                }
            });
        });
    }
}

// Initialize the extension when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new TabAutoReloader();
});