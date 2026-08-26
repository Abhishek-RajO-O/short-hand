import { useEffect, useState } from 'react';
import { getMessages, deleteMessage, saveMessage } from '../services/storage';
import MessageForm from '../components/MessageForm';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

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

  // THIS IS THE FIX: It saves to storage, then immediately updates the React state
  const handleSave = async (messageData) => {
    try {
      await saveMessage(messageData);
      const updatedMessages = await getMessages();
      setMessages(updatedMessages);
      
      // Close modal and reset edit state
      setIsModalOpen(false);
      setEditingMessage(null);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-darkNavy text-offWhite p-8 w-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Add Button */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-gold text-4xl font-bold">ShortHand Dashboard</h1>
            <p className="text-gray-300 mt-2 text-lg">Manage your saved messages and shortcuts.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-darkNavy hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            + Add New Shortcut
          </button>
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

                  <p className="text-offWhite whitespace-pre-wrap mb-6 grow">
                    {message.text}
                  </p>

                  <div className="flex justify-end border-t border-darkNavy pt-4 gap-3">
                    <button 
                      onClick={() => handleEdit(message)} 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
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

        {/* Modal Overlay for MessageForm */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-darkGrey rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-700">
              <h2 className="text-2xl text-gold font-bold mb-6">
                {editingMessage ? 'Edit Shortcut' : 'Add New Shortcut'}
              </h2>
              <MessageForm 
                initialData={editingMessage} 
                onSubmit={handleSave} 
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingMessage(null);
                }} 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;