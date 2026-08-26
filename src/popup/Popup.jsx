import { useEffect, useState } from 'react';
import { getMessages, getAllowedSites, addAllowedSite, removeAllowedSite } from '../services/storage';

const Popup = () => {
  const [currentDomain, setCurrentDomain] = useState('');
  const [isSiteAllowed, setIsSiteAllowed] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await getMessages();
        setMessageCount(msgs.length);
      } catch (error) {
        console.error('Failed to fetch messages.', error);
      }
    };
    fetchMessages();
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

  return (
    <div className="flex flex-col h-full bg-darkNavy text-offWhite w-full">
      {currentDomain && (
        <div className="bg-darkGrey px-4 py-3 flex items-center justify-between border-b border-gray-700 shadow-sm">
          <div className="flex flex-col truncate mr-2 max-w-[170px]">
            <span className="text-sm font-medium truncate text-gray-200" title={currentDomain}>
              {currentDomain}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              (Refresh page to apply)
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
      
      <div className="flex flex-col flex-1 p-4">
        <header className="mb-6 text-center mt-2">
          <h1 className="text-gold text-3xl font-bold">ShortHand</h1>
        </header>
        
        <main className="flex-1 flex flex-col gap-6">
          <div className="bg-darkGrey p-6 rounded-xl flex items-center justify-center shadow-md">
            <p className="text-xl font-medium">{messageCount} message{messageCount !== 1 && 's'} saved</p>
          </div>
          
          <div className="flex flex-col gap-3 mt-auto mb-2">
            <button 
              onClick={handleOpenDashboard}
              className="bg-gold text-darkNavy font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-md"
            >
              Open Dashboard
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Popup;
