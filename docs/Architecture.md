# Architecture & Tech Stack

## 1. Technology Stack
*   **Framework:** React (using JSX).
*   **Build Tool:** Vite.
*   **Styling:** Tailwind CSS.
*   **Platform:** Chrome Extension Manifest V3.
*   **Storage:** Chrome Storage API (`chrome.storage.local`).

## 2. Application Flow
*   **Popup:** Accessed via the Chrome toolbar. Displays a quick view of templates, search, and actions.
*   **Dashboard:** A full-page React application opened in a new browser tab for robust management of messages and categories.
*   **Content Script:** Runs silently on the target website (`https://chatgpt.com/*`), listening to keystrokes and DOM events to trigger text expansion.

## 3. Directory Structure
short-hand/
├── public/
│   └── icons/
├── src/
│   ├── popup/           # Extension toolbar popup UI
│   ├── dashboard/       # Full-page management UI
│   ├── components/      # Reusable UI components (MessageCard, Forms, etc.)
│   ├── content/         # DOM listeners and text expansion logic
│   ├── services/        # Abstraction layer for chrome.storage
│   └── utils/           # Helper functions
├── manifest.json
├── vite.config.js
└── package.json