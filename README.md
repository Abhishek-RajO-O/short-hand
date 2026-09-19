# ShortHand 🚀

**ShortHand** is a lightweight, privacy-first Chrome Extension (Manifest V3) designed to accelerate repetitive typing workflows. Built primarily for customer support, messaging, and AI prompt engineering, ShortHand allows users to define custom text shortcuts (e.g., `;refund`, `;hello`) that expand automatically into full templates across ChatGPT, CRMs, and any web-based text editor.

---

## ✨ Features

- **⚡ Instant Text Expansion:** Automatically detects typed triggers and expands them into rich templates upon pressing `Space`.
- **🌐 Dynamic Website Management:** Toggle ShortHand on or off for specific domains directly from the popup—no page reload required.
- **📊 Management Dashboard:** Dedicated full-page React UI to create, edit, delete, and organize shortcuts.
- **📁 Categorization & Real-Time Search:** Group templates into custom categories and filter shortcuts instantly by keyword or trigger.
- **🔔 Smart Unknown Shortcut Prompt:** Displays a non-intrusive toast notification when an unregistered shortcut (starting with `;` or `-`) is typed, offering a one-click option to save it.
- **💾 Import & Export (Backup):** Native JSON import and export capability to back up or transfer templates across devices.
- **🔒 Privacy-First Storage:** Operates 100% locally using Chrome's native `chrome.storage.local` API—no external servers or data tracking.

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite (configured with Rollup multi-input bundling for Chrome Extensions)
- **Styling:** Tailwind CSS (Dark Theme UI)
- **Extension Engine:** Chrome Extension API (Manifest V3)
- **Storage:** `chrome.storage.local` with fallback to `localStorage` for browser development

---

## 📂 Project Structure

```text
short-hand/
├── public/
│   └── manifest.json         # Extension Manifest V3 configuration
├── src/
│   ├── components/           # Reusable UI components (MessageForm, WebsiteManager, etc.)
│   ├── content/
│   │   └── contentScript.js  # DOM keystroke interceptor & expansion engine
│   ├── dashboard/            # Full-page Dashboard app (React)
│   ├── popup/                # Extension Popup interface (React)
│   └── services/
│       └── storage.js        # Chrome storage abstraction layer
├── vite.config.js            # Vite build setup for extension entry points
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/short-hand.git](https://github.com/your-username/short-hand.git)
   cd short-hand
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```
   This will generate a `dist` folder containing the compiled extension assets.

---

## 🧩 Loading into Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the **`dist`** directory inside your `short-hand` project folder.
5. Pin **ShortHand** to your extension toolbar for easy access.

---

## 📖 How to Use

1. **Activate a Website:** Click the ShortHand extension icon on any active tab and click **"Enable on this site"**.
2. **Create Shortcuts:** Open the Dashboard via the popup or extension page to create shortcuts (e.g., `;refund` ➔ *"Hello! Your refund has been processed successfully."*).
3. **Trigger Expansion:** Click into any text field on an enabled site, type your shortcut, and press `Space`.
4. **Manage Templates:** Use the Dashboard to organize templates into categories, search saved items, or export backups.

---

## 🛣️ Roadmap (V2 Features)

- [ ] **Usage Analytics:** Track `lastUsedAt` timestamps to surface most frequently used templates.
- [ ] **Inline Popup Quick-Add:** View recent shortcuts and create/edit templates directly inside the extension popup window.
- [ ] **Variable Placeholders:** Support dynamic template variables (e.g., `{name}`, `{date}`) filled via a quick popup modal prior to insertion.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.