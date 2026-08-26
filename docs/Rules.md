# Development Rules & Constraints

## 1. Strict V1 Boundaries
*   **No Backend:** Do not implement databases, servers, or cloud synchronization.
*   **No Authentication:** Do not add login or user account systems.
*   **Target Domain:** Hardcode the content script to run only on `https://chatgpt.com/*`.

## 2. Technical Guidelines
*   **State Management:** Keep it simple. Rely on React state/context and `chrome.storage.local`.
*   **Dependencies:** Minimal dependencies. Use native DOM APIs and standard React hooks before introducing third-party libraries.
*   **Rich Text Editors:** When implementing the content script, assume the target input may be a `contenteditable` element, not just a standard `<textarea>`.

## 3. Workflow Rules
*   **Incremental Builds:** Build component by component. Never generate or implement massive blocks of unrelated features simultaneously.
*   **Test-Driven Execution:** Every feature must be manually tested and verified in the Chrome browser (via "Load unpacked") before committing or moving to the next phase.