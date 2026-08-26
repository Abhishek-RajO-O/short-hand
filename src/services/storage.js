export const getMessages = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(['messages']);
    return result.messages || [];
  }
  
  // Fallback for local development outside of extension context
  console.warn('chrome.storage is not available. Falling back to localStorage.');
  const result = localStorage.getItem('messages');
  return result ? JSON.parse(result) : [];
};

export const saveMessage = async (message) => {
  const messages = await getMessages();
  const updatedMessages = [...messages, message];
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ messages: updatedMessages });
  } else {
    // Fallback for local development outside of extension context
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  }
};

export const deleteMessage = async (id) => {
  const messages = await getMessages();
  const updatedMessages = messages.filter(msg => msg.id !== id);
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ messages: updatedMessages });
  } else {
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  }
};

