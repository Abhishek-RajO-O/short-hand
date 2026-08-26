// Fetch messages from storage to create a quick lookup map
let shortcutsMap = {};

const loadShortcuts = () => {
  chrome.storage.local.get(['messages'], (result) => {
    const messages = result.messages || [];
    shortcutsMap = messages.reduce((acc, msg) => {
      // Store without trailing space if any
      acc[msg.shortcut.trim()] = msg.text;
      return acc;
    }, {});
  });
};

// Initial load
loadShortcuts();

// Listen for changes in storage to update shortcutsMap dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.messages) {
    const messages = changes.messages.newValue || [];
    shortcutsMap = messages.reduce((acc, msg) => {
      acc[msg.shortcut.trim()] = msg.text;
      return acc;
    }, {});
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    const el = document.activeElement;
    if (!el) return;

    const isTextarea = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT';
    const isContentEditable = el.isContentEditable;

    if (!isTextarea && !isContentEditable) return;

    if (isTextarea) {
      const text = el.value;
      const cursor = el.selectionStart;
      const textBeforeCursor = text.slice(0, cursor);
      const match = textBeforeCursor.match(/(\S+)$/);
      
      if (match) {
        const lastWord = match[1];
        if (shortcutsMap[lastWord]) {
          event.preventDefault(); // Stop the space from being typed
          
          const fullText = shortcutsMap[lastWord];
          const newText = text.slice(0, cursor - lastWord.length) + fullText + text.slice(cursor);
          
          el.value = newText;
          const newCursor = cursor - lastWord.length + fullText.length;
          el.setSelectionRange(newCursor, newCursor);
          
          // Dispatch input event to notify React/Framework
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else if (isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed) return;

      const node = range.startContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const cursor = range.startOffset;
        const textBeforeCursor = text.slice(0, cursor);
        const match = textBeforeCursor.match(/(\S+)$/);
        
        if (match) {
          const lastWord = match[1];
          if (shortcutsMap[lastWord]) {
            event.preventDefault(); // Stop the space from being typed
            
            const fullText = shortcutsMap[lastWord];
            
            // Select the shortcut text
            range.setStart(node, cursor - lastWord.length);
            range.setEnd(node, cursor);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Use execCommand to replace the selection.
            // This is the most reliable way to insert text into a contenteditable
            // while preserving undo history and triggering framework events.
            document.execCommand('insertText', false, fullText);
          }
        }
      }
    }
  }
}, true); // Use capture phase to intercept before React/ProseMirror

