import { useEffect, useState } from 'react';
import { getMessages, saveMessage, getCategories, getAllowedSites, addAllowedSite, removeAllowedSite } from '../services/storage';
import MessageForm from '../components/MessageForm';

const Popup = () => {
  const [currentDomain, setCurrentDomain] = useState('');
  const [isSiteAllowed, setIsSiteAllowed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState(['General']);
  
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingMessage, setEditingMessage] = useState(null);

  const fetchData = async () => {
    try {
      const msgs = await getMessages();
      setMessages(msgs);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch data.', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Check current tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          try {
            const urlObj = new URL(tabs[0].url);
            // Ignore chrome:// or edge:// urls
            if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
              let hostname = urlObj.hostname;
              if (hostname.startsWith('www.')) {
                hostname = hostname.slice(4);
              }
              setCurrentDomain(hostname);
              
              const allowed = await getAllowedSites();
              setIsSiteAllowed(allowed.some(site => hostname.includes(site)));
            }
          } catch (e) {
            console.error('Invalid URL', e);
          }
        }
      });
    } else {
      setCurrentDomain('local.dev');
    }
  }, []);

  const handleToggleSite = async () => {
    if (!currentDomain || currentDomain === 'local.dev') return;
    
    if (isSiteAllowed) {
      await removeAllowedSite(currentDomain);
      setIsSiteAllowed(false);
    } else {
      await addAllowedSite(currentDomain);
      setIsSiteAllowed(true);
    }
  };

  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    } else {
      window.open('/dashboard.html', '_blank'); // fallback for local dev
    }
  };

  const handleSaveMessage = async (messageData) => {
    await saveMessage(messageData);
    await fetchData();
    setView('list');
    setEditingMessage(null);
  };

  if (view === 'form') {
    return (
      <div className="flex flex-col bg-darkNavy text-offWhite w-[350px] min-h-[450px] p-4 overflow-y-auto">
        <button 
          onClick={() => { setView('list'); setEditingMessage(null); }} 
          className="text-gray-400 mb-4 text-left hover:text-white transition-colors flex items-center gap-1"
        >
          <span>&larr;</span> Back to list
        </button>
        <h2 className="text-xl text-gold font-bold mb-4">{editingMessage ? 'Edit Shortcut' : 'Add Shortcut'}</h2>
        <MessageForm 
          initialData={editingMessage}
          categories={categories}
          onSubmit={handleSaveMessage}
          onCancel={() => { setView('list'); setEditingMessage(null); }}
        />
      </div>
    );
  }

  // Sort by lastUsedAt (descending) or by id (descending) as fallback
  const sortedMessages = [...messages].sort((a, b) => {
    const aTime = a.lastUsedAt || a.id || 0;
    const bTime = b.lastUsedAt || b.id || 0;
    return bTime - aTime;
  });
  const recentMessages = sortedMessages.slice(0, 4);

  return (
    <div className="flex flex-col bg-darkNavy text-offWhite w-[350px] min-h-[450px]">
      {currentDomain && (
        <div className="bg-darkGrey px-4 py-3 flex items-center justify-between border-b border-gray-700 shadow-sm shrink-0">
          <div className="flex flex-col truncate mr-2 max-w-[170px]">
            <span className="text-sm font-medium truncate text-gray-200" title={currentDomain}>
              {currentDomain}
            </span>
          </div>
          <button
            onClick={handleToggleSite}
            className={`text-xs font-bold py-1.5 px-3 rounded-full transition-colors whitespace-nowrap shadow-sm ${
              isSiteAllowed 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-offWhite'
            }`}
          >
            {isSiteAllowed ? 'Enabled' : 'Enable on this site'}
          </button>
        </div>
      )}
      
      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <header className="mb-4 text-center mt-2 flex flex-col items-center justify-center shrink-0">
          <h1 className="text-gold text-3xl font-bold">ShortHand</h1>
          <p className="text-gray-400 text-sm mt-1">{messages.length} message{messages.length !== 1 && 's'} saved</p>
        </header>
        
        <div className="mb-4 shrink-0">
          <button 
            onClick={() => setView('form')}
            className="w-full bg-gold text-darkNavy font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Shortcut
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {recentMessages.length > 0 && (
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 mt-2">Recently Used</h3>
          )}
          {recentMessages.map(msg => (
            <div key={msg.id} className="bg-darkGrey rounded-lg p-3 flex flex-col gap-1 shadow-sm border border-transparent hover:border-gray-600 transition-colors group">
              <div className="flex justify-between items-start">
                <span className="text-gold font-bold bg-darkNavy px-2 py-0.5 rounded text-xs">
                  {msg.shortcut}
                </span>
                <button 
                  onClick={() => { setEditingMessage(msg); setView('form'); }}
                  className="text-gray-400 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-300 truncate mt-1">{msg.text}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-4 text-sm">
              No shortcuts saved yet.
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700 shrink-0">
          <button 
            onClick={handleOpenDashboard}
            className="w-full bg-darkGrey border border-gray-600 text-offWhite font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
          >
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
