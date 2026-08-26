import { useEffect, useState } from 'react';
import { getMessages, deleteMessage } from '../services/storage';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await getMessages();
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-darkNavy text-offWhite p-8 w-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-gold text-4xl font-bold">ShortHand Dashboard</h1>
          <p className="text-gray-300 mt-2 text-lg">Manage your saved messages and shortcuts.</p>
        </header>
        
        <main>
          {messages.length === 0 ? (
            <div className="bg-darkGrey p-8 rounded-xl text-center shadow-md">
              <p className="text-xl">No messages saved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="bg-darkGrey p-6 rounded-xl flex flex-col justify-between w-full shadow-md"
                >
                  <div className="mb-4">
                    <span className="bg-gold text-darkNavy font-bold px-3 py-1 rounded-md text-sm">
                      {message.shortcut}
                    </span>
                  </div>

                  <p className="text-offWhite whitespace-pre-wrap mb-6 flex-grow">
                    {message.text}
                  </p>

                  <div className="flex justify-end border-t border-darkNavy pt-4">
                    <button 
                      onClick={() => handleDelete(message.id)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;