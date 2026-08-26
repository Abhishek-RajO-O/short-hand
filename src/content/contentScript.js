let isSiteAllowed = false;
let isListenerAttached = false;
let shortcutsMap = {};

const currentHost = window.location.hostname.replace(/^www\./, '').toLowerCase();

const checkAllowedSites = (allowedSites) => {
const checkDomain = (allowedSites) => {
  const sites = allowedSites || ['chatgpt.com'];
  isSiteAllowed = sites.some(site => currentHost.includes(site));
  return sites.some(site => currentHost.includes(site));
};

const handleKeyDown = (event) => {
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
        const matchedMessage = shortcutsMap[lastWord];
        if (matchedMessage) {
          event.preventDefault(); // Stop the space from being typed
          
          const fullText = matchedMessage.text;
          const newText = text.slice(0, cursor - lastWord.length) + fullText + text.slice(cursor);
          
          el.value = newText;
          const newCursor = cursor - lastWord.length + fullText.length;
          el.setSelectionRange(newCursor, newCursor);
          
          // Dispatch input event to notify React/Framework
          el.dispatchEvent(new Event('input', { bubbles: true }));

          updateLastUsed(matchedMessage.id);
        } else if (lastWord.startsWith(';') || lastWord.startsWith('-')) {
          showUnknownShortcutPrompt(lastWord);
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
          const matchedMessage = shortcutsMap[lastWord];
          if (matchedMessage) {
            event.preventDefault(); // Stop the space from being typed
            
            const fullText = matchedMessage.text;
            
            // Select the shortcut text
            range.setStart(node, cursor - lastWord.length);
            range.setEnd(node, cursor);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Use execCommand to replace the selection.
            // This is the most reliable way to insert text into a contenteditable
            // while preserving undo history and triggering framework events.
            document.execCommand('insertText', false, fullText);

            updateLastUsed(matchedMessage.id);
          } else if (lastWord.startsWith(';') || lastWord.startsWith('-')) {
            showUnknownShortcutPrompt(lastWord);
          }
        }
      }
    }
  }
};

const toggleListener = (isAllowed) => {
  if (isAllowed && !isListenerAttached) {
    document.addEventListener('keydown', handleKeyDown, true);
    isListenerAttached = true;
  } else if (!isAllowed && isListenerAttached) {
    document.removeEventListener('keydown', handleKeyDown, true);
    isListenerAttached = false;
  }
};

// Initial load for allowed sites
chrome.storage.local.get(['allowedSites'], (result) => {
  checkAllowedSites(result.allowedSites);
  const isAllowed = checkDomain(result.allowedSites);
  toggleListener(isAllowed);
});

const loadShortcuts = () => {
  chrome.storage.local.get(['messages'], (result) => {
    const messages = result.messages || [];
    shortcutsMap = messages.reduce((acc, msg) => {
      // Store whole message object for ID access
      acc[msg.shortcut.trim()] = msg;
      return acc;
    }, {});
  });
};

// Initial load for shortcuts
loadShortcuts();

// Listen for changes in storage to update maps dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.allowedSites) {
      checkAllowedSites(changes.allowedSites.newValue);
      const isAllowed = checkDomain(changes.allowedSites.newValue);
      toggleListener(isAllowed);
    }
    
    if (changes.messages) {
      const messages = changes.messages.newValue || [];
      shortcutsMap = messages.reduce((acc, msg) => {
        acc[msg.shortcut.trim()] = msg;
        return acc;
      }, {});
    }
  }
});

const updateLastUsed = (id) => {
  chrome.storage.local.get(['messages'], (result) => {
    const messages = result.messages || [];
    const index = messages.findIndex(msg => msg.id === id);
    if (index >= 0) {
      messages[index].lastUsedAt = Date.now();
      chrome.storage.local.set({ messages });
    }
  });
};

const showUnknownShortcutPrompt = (word) => {
  // Remove existing prompt if any
  const existing = document.getElementById('shorthand-unknown-prompt');
  if (existing) {
    existing.remove();
  }

  // Create toast container
  const toast = document.createElement('div');
  toast.id = 'shorthand-unknown-prompt';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background-color: #222831;
    color: #EEEEEE;
    border: 1px solid #393E46;
    border-radius: 8px;
    z-index: 999999;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 250px;
  `;

  // Content
  const text = document.createElement('p');
  text.style.margin = '0';
  text.style.fontSize = '14px';
  text.textContent = `Shortcut '${word}' not found. Add it?`;
  toast.appendChild(text);

  // Buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '8px';

  // Ignore button
  const ignoreBtn = document.createElement('button');
  ignoreBtn.textContent = 'Ignore';
  ignoreBtn.style.cssText = `
    background: transparent;
    color: #9CA3AF;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s;
  `;
  ignoreBtn.onmouseover = () => ignoreBtn.style.backgroundColor = '#393E46';
  ignoreBtn.onmouseout = () => ignoreBtn.style.backgroundColor = 'transparent';
  ignoreBtn.onclick = () => toast.remove();

  // Add Reply button
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Reply';
  addBtn.style.cssText = `
    background-color: #FFD369;
    color: #222831;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: opacity 0.2s;
  `;
  addBtn.onmouseover = () => addBtn.style.opacity = '0.9';
  addBtn.onmouseout = () => addBtn.style.opacity = '1';
  addBtn.onclick = () => {
    toast.remove();
    window.open(chrome.runtime.getURL('dashboard.html'), '_blank');
  };

  buttonContainer.appendChild(ignoreBtn);
  buttonContainer.appendChild(addBtn);
  toast.appendChild(buttonContainer);

  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.remove();
    }
  }, 5000);
};

document.addEventListener('keydown', (event) => {
  if (!isSiteAllowed) return; // Silently exit if not allowed

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
        const matchedMessage = shortcutsMap[lastWord];
        if (matchedMessage) {
          event.preventDefault(); // Stop the space from being typed
          
          const fullText = matchedMessage.text;
          const newText = text.slice(0, cursor - lastWord.length) + fullText + text.slice(cursor);
          
          el.value = newText;
          const newCursor = cursor - lastWord.length + fullText.length;
          el.setSelectionRange(newCursor, newCursor);
          
          // Dispatch input event to notify React/Framework
          el.dispatchEvent(new Event('input', { bubbles: true }));

          updateLastUsed(matchedMessage.id);
        } else if (lastWord.startsWith(';') || lastWord.startsWith('-')) {
          showUnknownShortcutPrompt(lastWord);
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
          const matchedMessage = shortcutsMap[lastWord];
          if (matchedMessage) {
            event.preventDefault(); // Stop the space from being typed
            
            const fullText = matchedMessage.text;
            
            // Select the shortcut text
            range.setStart(node, cursor - lastWord.length);
            range.setEnd(node, cursor);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Use execCommand to replace the selection.
            // This is the most reliable way to insert text into a contenteditable
            // while preserving undo history and triggering framework events.
            document.execCommand('insertText', false, fullText);

            updateLastUsed(matchedMessage.id);
          } else if (lastWord.startsWith(';') || lastWord.startsWith('-')) {
            showUnknownShortcutPrompt(lastWord);
          }
        }
      }
    }
  }
}, true); // Use capture phase to intercept before React/ProseMirror
