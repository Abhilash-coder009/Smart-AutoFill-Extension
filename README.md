# 🤖 Smart AutoFill Assistant

An AI-powered browser extension that intelligently fills forms with your profile data. Built for Chrome and Edge.

---

## ✨ Features

* 🧠 **AI-Powered Field Detection** – Automatically identifies form fields
* 👤 **Multiple Profiles** – Work, Personal, and Fake Data profiles
* 🔒 **Privacy First** – All data stored locally, never leaves your computer
* 📝 **Form Learning** – Remembers form structures for future visits
* ⚡ **One-Click Fill** – Fill entire forms instantly
* 🎨 **Beautiful UI** – Clean gradient design

---

## 📋 Supported Fields

The extension can automatically fill:

* Name (First Name, Last Name, Full Name)
* Email Address
* Phone / Mobile Number
* Address, Street, City, State, ZIP Code, Country
* Company Name, Job Title
* Website URL, Username
* Birthday, Age, Gender

---

## 🚀 Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome/Edge and go to:

```
chrome://extensions/
```

3. Enable **Developer Mode** (top right)
4. Click **Load unpacked**
5. Select the extension folder

---

### From Chrome Web Store (Coming Soon)

Link will be added after publication

---

## 🎯 How to Use

1. Click the extension icon in your browser toolbar
2. Select a profile (Work / Personal / Fake)
3. Click **Auto Fill Form**
4. The extension will automatically fill the form for you

---

## ⌨️ Keyboard Shortcuts

| Shortcut           | Action         |
| ------------------ | -------------- |
| `Ctrl + Shift + F` | Auto fill form |
| `Ctrl + Shift + C` | Clear form     |

---

## 🛠️ Development

### Project Structure

```
Smart-AutoFill-Assistant/
│
├── manifest.json        # Extension configuration
├── popup.html           # Extension popup UI
├── popup.css
├── popup.js
│
├── content.js           # Main form filling logic
├── background.js        # Background service worker
│
├── options.html         # Settings page
├── options.css
├── options.js
│
└── icons/               # Extension icons
```

---

### Local Testing

1. Make changes to the code
2. Open `chrome://extensions/`
3. Click the **Refresh** icon on the extension
4. Refresh your test page
5. Test the updated functionality

---

## 📝 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project for both personal and commercial use.

---

## 👨‍💻 Author

**M Abhilash Kumar**

* GitHub: [@yourusername](https://github.com/yourusername)

---

## ⭐ Support

If you found this extension useful, please consider giving the repository a **star ⭐** on GitHub.

---

## 🔒 Privacy

This extension **does NOT**:

* Collect any personal data
* Send data to any server
* Track your browsing
* Use external APIs

All profile data is stored **locally in your browser** using Chrome's storage API.

---

Made with ❤️ by **M Abhilash Kumar**
