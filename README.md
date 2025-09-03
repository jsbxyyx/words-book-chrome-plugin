# Word Book Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)

**Language / 语言**: [English](README.md) | [中文](README_zh.md)

A powerful Chrome extension for learning and managing English vocabulary with automatic translation capabilities.

## ✨ Features

### 🎯 Core Features
- **Right-click to Add Words**: Select any text on a webpage and add it to your word book via right-click menu
- **Automatic Translation**: Powered by DeepL API for accurate Chinese translations
- **Smart Word Management**: Organize, search, and sort your vocabulary
- **Study Mode**: Interactive flashcard system for effective learning
- **Familiarity Tracking**: Mark words as unfamiliar or familiar to focus your studies

### 📊 Advanced Features
- **Progress Statistics**: Track total words, familiar words, and words needing review
- **Multiple Sorting Options**: Sort by date added, alphabetical order, or familiarity level
- **Local Backup Dictionary**: Fallback dictionary for common English words
- **Custom Delete Confirmation**: Beautiful confirmation dialog for word deletion
- **Responsive Design**: Optimized for different screen sizes

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "Word Book Extension"
3. Click "Add to Chrome"

### Method 2: Manual Installation
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## 📖 Usage Guide

### Adding Words
1. **Right-click Method**: 
   - Select any English text on a webpage
   - Right-click and choose "Add to Word Book"
   - The word will be added without translation

### Getting Translations
1. Open the extension popup
2. Find words without translation (showing a "🔄 Translate" button)
3. Click the translate button to get automatic translation

### Study Mode
1. Click the "🎯" button in the header
2. Words will be shown randomly, prioritizing unfamiliar ones
3. Click "Show Meaning" to reveal the translation
4. Mark words as "Familiar" or "Unfamiliar"

### Managing Words
- **Search**: Use the search box to find specific words
- **Sort**: Choose from date added, alphabetical, or familiarity sorting
- **Delete**: Click the trash icon and confirm deletion
- **Mark Familiarity**: Click the circle icon to cycle through familiarity levels

## 📁 Project Structure

```
word-book-extension/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── content.js            # Content script
├── options.html          # Settings page
├── options.js            # Settings functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md             # This file (English)
└── README_zh.md          # Chinese version
```

## 🎨 Features in Detail

### Statistics Dashboard
- **Total Words**: Shows the total number of words in your collection
- **Familiar Words**: Words marked as familiar during study sessions
- **Need Review**: Words that are unfamiliar or haven't been reviewed

### Study Algorithm
The study mode uses an intelligent algorithm that:

- Prioritizes unfamiliar words
- Randomizes word order to prevent memorization patterns
- Tracks review frequency and dates
- Adapts to your learning progress

### Data Storage
- All data is stored locally using Chrome's storage API
- No data is sent to external servers except for translation requests
- Automatic backup and sync across Chrome instances

## 🔒 Privacy & Security

### Data Collection
- The extension only collects words you explicitly add
- No browsing history or personal information is stored
- Translation requests are sent only when you click the translate button

### Permissions
- **storage**: For saving your word collection locally
- **contextMenus**: For the right-click "Add to Word Book" feature
- **activeTab**: For accessing selected text on webpages
- **notifications**: For showing success/error messages
- **host permissions**: Only for the translation API endpoint

## 🐛 Troubleshooting

### Common Issues

**Translation not working**
- Check your internet connection
- The translation service might be temporarily unavailable
- Local dictionary will be used as fallback

**Right-click menu not appearing**
- Make sure you have selected text before right-clicking
- Try refreshing the webpage
- Check if the extension is enabled

**Words not saving**
- Check Chrome storage permissions
- Try restarting the browser

## 🚧 Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of HTML, CSS, JavaScript
- Chrome Extensions development understanding

### Building
1. Clone the repository
2. Make your changes
3. Test in Chrome developer mode
4. Package for distribution

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**jsbxyyx**
- GitHub: [@jsbxyyx](https://github.com/jsbxyyx)

## 🙏 Acknowledgments

- DeepL for providing translation services
- Chrome Extensions documentation and community
- All contributors and users of this extension

## 📈 Changelog

### v1.0.0 (2025-09-03)
- Initial release
- Right-click word addition
- Automatic translation with DeepL API
- Study mode with familiarity tracking
- Custom delete confirmation dialog
- Responsive design

---

**Happy Learning!** 📚✨

**Language / 语言**: [English](README.md) | [中文](README_zh.md)
