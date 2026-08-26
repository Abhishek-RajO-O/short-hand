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
  
  // Check if a message with this ID already exists
  const existingIndex = messages.findIndex(msg => msg.id === message.id);
  
  let updatedMessages;
  if (existingIndex >= 0) {
    // If it exists, replace it (this handles Edits)
    updatedMessages = [...messages];
    updatedMessages[existingIndex] = message;
  } else {
    // If it doesn't exist, append it (this handles Create)
    updatedMessages = [...messages, message];
  }
  
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

export const getCategories = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(['categories']);
    return result.categories || ['General'];
  }
  const result = localStorage.getItem('categories');
  return result ? JSON.parse(result) : ['General'];
};

export const addCategory = async (name) => {
  const categories = await getCategories();
  if (!categories.includes(name)) {
    const updatedCategories = [...categories, name];
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ categories: updatedCategories });
    } else {
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  }
};

export const deleteCategory = async (name) => {
  if (name === 'General') return; // Protect General category
  
  const categories = await getCategories();
  const updatedCategories = categories.filter(c => c !== name);
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ categories: updatedCategories });
  } else {
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  }
  
  // Re-assign messages in this category to 'General'
  const messages = await getMessages();
  let updated = false;
  const updatedMessages = messages.map(msg => {
    if (msg.category === name) {
      updated = true;
      return { ...msg, category: 'General' };
    }
    return msg;
  });
  
  if (updated) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ messages: updatedMessages });
    } else {
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  }
};

export const bulkSaveMessages = async (newMessages) => {
  if (!Array.isArray(newMessages)) return;
  
  const existingMessages = await getMessages();
  const mergedMessages = [...existingMessages];
  
  newMessages.forEach(newMsg => {
    const existingIndex = mergedMessages.findIndex(msg => msg.id === newMsg.id);
    if (existingIndex >= 0) {
      mergedMessages[existingIndex] = newMsg;
    } else {
      mergedMessages.push(newMsg);
    }
  });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ messages: mergedMessages });
  } else {
    localStorage.setItem('messages', JSON.stringify(mergedMessages));
  }
};

export const getAllowedSites = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(['allowedSites']);
    return result.allowedSites || ['chatgpt.com'];
  }
  const result = localStorage.getItem('allowedSites');
  return result ? JSON.parse(result) : ['chatgpt.com'];
};

export const addAllowedSite = async (domain) => {
  const sites = await getAllowedSites();
  // Strip protocol and path if the user pasted a full URL
  let cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].trim().toLowerCase();
  
  if (cleanDomain && !sites.includes(cleanDomain)) {
    const updatedSites = [...sites, cleanDomain];
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ allowedSites: updatedSites });
    } else {
      localStorage.setItem('allowedSites', JSON.stringify(updatedSites));
    }
  }
};

export const removeAllowedSite = async (domain) => {
  const sites = await getAllowedSites();
  const updatedSites = sites.filter(s => s !== domain);
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ allowedSites: updatedSites });
  } else {
    localStorage.setItem('allowedSites', JSON.stringify(updatedSites));
  }
};
