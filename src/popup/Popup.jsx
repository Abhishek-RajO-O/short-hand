import { useEffect } from 'react';
import { getMessages, saveMessage } from '../services/storage';

const Popup = () => {
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await getMessages();
        console.log('Fetched messages on mount:', msgs);
      } catch (error) {
        console.error('Failed to fetch messages. Note: chrome.storage is only available in extension context.', error);
      }
    };
    fetchMessages();
  }, []);

  const handleAddMessage = async () => {
    const dummyMessage = {
      id: Date.now(),
      shortcut: ';test',
      text: 'This is a test message'
    };
    try {
      await saveMessage(dummyMessage);
      console.log('Successfully saved dummy message:', dummyMessage);
    } catch (error) {
      console.error('Failed to save message. Note: chrome.storage is only available in extension context.', error);
    }
  };

  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    } else {
      console.warn('chrome.tabs is not available. Please test inside an extension context.');
      window.open('/dashboard.html', '_blank'); // fallback for local dev
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <header className="mb-6 text-center">
        <h1 className="text-gold text-3xl font-bold">ShortHand</h1>
      </header>
      
      <main className="grow flex flex-col gap-6">
        <div className="bg-darkGrey p-6 rounded-xl flex items-center justify-center shadow-sm">
          <p className="text-xl font-medium">0 messages saved</p>
        </div>
        
        <div className="flex flex-col gap-3 mt-auto mb-2">
          <button 
            onClick={handleAddMessage}
            className="bg-gold text-darkNavy font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Add Message
          </button>
          <button 
            onClick={handleOpenDashboard}
            className="bg-darkGrey text-offWhite font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Open Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default Popup;
