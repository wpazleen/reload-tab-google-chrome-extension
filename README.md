# Tab Auto Reloader Chrome Extension

A Chrome browser extension that automatically reloads selected tabs at specified intervals to keep your browser active.

## Features

✅ **Auto-reload current tab** - Automatically refresh the active tab  
✅ **Customizable intervals** - Choose from 5 seconds to 5 minutes  
✅ **Keep browser active** - Prevents browser from going idle  
✅ **Real-time countdown** - See when the next reload will happen  
✅ **Easy controls** - Simple start/stop functionality  
✅ **Beautiful UI** - Modern and intuitive interface  

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Enable Developer Mode**:
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

2. **Load the Extension**:
   - Click "Load unpacked"
   - Select the folder containing these extension files
   - The extension will appear in your extensions list

3. **Pin the Extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Tab Auto Reloader" and click the pin icon

### Method 2: Create Icons (Optional)

The extension needs icons to work properly. Create these files in an `icons` folder:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels) 
- `icon128.png` (128x128 pixels)

You can use any image editor or online icon generator to create simple reload/refresh icons.

## How to Use

1. **Open the Extension**:
   - Click the Tab Auto Reloader icon in your Chrome toolbar
   - The popup will show the current tab information

2. **Set Reload Interval**:
   - Choose your desired interval from the dropdown (5 seconds to 5 minutes)
   - Default is 10 seconds

3. **Start Auto Reload**:
   - Click "Start Auto Reload" button
   - The status will change to "Active" with a green indicator
   - You'll see a countdown to the next reload

4. **Stop Auto Reload**:
   - Click "Stop Auto Reload" button anytime
   - The extension will stop reloading the tab

## Use Cases

- **Keep browser sessions active** during long work periods
- **Monitor live data** that updates frequently
- **Prevent timeouts** on web applications
- **Auto-refresh dashboards** and monitoring tools
- **Keep video calls active** in web browsers

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: tabs, activeTab, storage
- **Background**: Service worker for reliable operation
- **Storage**: Local storage for settings persistence

## Files Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Main interface
├── popup.css              # Styling
├── popup.js               # Frontend logic
├── background.js          # Background service worker
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Troubleshooting

**Extension not working?**
- Make sure you're on a regular webpage (not chrome:// pages)
- Check that the extension has proper permissions
- Reload the extension in chrome://extensions/

**Tab not reloading?**
- Ensure the tab is still open and accessible
- Some websites may prevent automatic reloading
- Check browser console for any errors

## Privacy & Security

- This extension only accesses the current active tab
- No data is sent to external servers
- All settings are stored locally in your browser
- The extension only reloads tabs when explicitly activated

---

**Developed by sabbirsam**

Enjoy using Tab Auto Reloader! 🔄
