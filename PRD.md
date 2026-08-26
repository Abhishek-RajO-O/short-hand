# Project Requirements Document (PRD): ShortHand

## 1. Project Overview
ShortHand is a lightweight, local-first Chrome extension designed to streamline workflows for BPO and customer support agents. It allows users to save frequently used responses and automatically expands short text triggers (shortcuts) into full messages within specific web text editors.

## 2. Target Audience
*   Customer support and BPO professionals who repeatedly type similar responses.
*   Primary persona: A user who needs speed and efficiency without the friction of navigating away from their active support window.

## 3. Core Features (V1)
*   **Targeted Execution:** Operates exclusively on `https://chatgpt.com/*` for development and testing.
*   **Shortcut Expansion:** Detects specific triggers (e.g., `;refund + Space`) and replaces them with a predefined full message.
*   **Unknown Shortcut Handling:** Displays an unobtrusive prompt allowing the user to quickly add a new message if an unrecognized shortcut is typed.
*   **Message Management (CRUD):** Users can Create, Read, Update, and Delete messages. 
*   **Categories:** Simple categorization (no nesting) for organizing messages.
*   **Persistent Local Storage:** All data is saved locally. No backend, no cloud sync, no authentication.

## 4. Future Scope (Post-V1)
*   Import/Export (JSON backup).
*   Dashboard search, shortcut suggestions, and autocomplete.
*   Favorites system.