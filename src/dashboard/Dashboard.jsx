import { useEffect, useState, useRef } from 'react';
import { getMessages, deleteMessage, saveMessage, getCategories, addCategory, deleteCategory, bulkSaveMessages } from '../services/storage';
import MessageForm from '../components/MessageForm';
import CategorySidebar from '../components/CategorySidebar';
import WebsiteManager from '../components/WebsiteManager';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState(['General']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const msgs = await getMessages();
      setMessages(msgs);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

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

  const handleAddCategory = async (name) => {
    try {
      await addCategory(name);
      setCategories(await getCategories());
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleDeleteCategory = async (name) => {
    try {
      await deleteCategory(name);
      setCategories(await getCategories());
      setMessages(await getMessages()); // Refresh messages since some might be moved to 'General'
      if (activeCategory === name) {
        setActiveCategory('All');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(messages, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shorthand-backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export backup.');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);
        
        if (!Array.isArray(parsed)) {
          throw new Error('Backup data must be an array of messages.');
        }

        await bulkSaveMessages(parsed);
        
        // Also auto-add any categories from the imported messages
        const importedCategories = [...new Set(parsed.map(m => m.category).filter(Boolean))];
        const currentCats = await getCategories();
        for (const cat of importedCategories) {
          if (!currentCats.includes(cat) && cat !== 'General') {
             await addCategory(cat);
          }
        }
        
        await fetchData(); // Re-fetch all data to update UI instantly
        alert('Backup imported successfully!');
      } catch (error) {
        console.error('Failed to parse backup:', error);
        alert('Invalid backup file. Please make sure it is a valid ShortHand JSON export.');
      }
      
      // Reset input so the same file can be imported again if needed
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const filteredMessages = messages.filter(msg => {
    const matchesCategory = activeCategory === 'All' || (msg.category || 'General') === activeCategory;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = msg.shortcut.toLowerCase().includes(lowerQuery) || msg.text.toLowerCase().includes(lowerQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-darkNavy text-offWhite p-8 w-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-gold text-4xl font-bold">ShortHand Dashboard</h1>
            <p className="text-gray-300 mt-2 text-lg">Manage your saved messages and shortcuts.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExport}
              className="bg-darkGrey text-offWhite hover:bg-gray-600 border border-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
            >
              Export
            </button>
            <button 
              onClick={handleImportClick}
              className="bg-darkGrey text-offWhite hover:bg-gray-600 border border-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
            >
              Import
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gold text-darkNavy hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors shadow-md ml-2"
            >
              + Add New Shortcut
            </button>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col md:flex-row gap-8">
          <CategorySidebar 
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          
          <main className="flex-1 flex flex-col gap-6">
            <WebsiteManager />
            <div className="flex items-center bg-darkGrey border border-gray-600 rounded-lg p-2 focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-shadow shadow-sm">
              <span className="text-gray-400 pl-2 pr-1">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts or messages..."
                className="w-full bg-transparent text-offWhite outline-none p-1"
              />
            </div>
            
            {filteredMessages.length === 0 ? (
              <div className="bg-darkGrey p-8 rounded-xl text-center shadow-md">
                <p className="text-xl">No messages found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className="bg-darkGrey p-6 rounded-xl flex flex-col justify-between w-full shadow-md"
                  >
                    <div className="mb-4 flex justify-between items-start">
                      <span className="bg-gold text-darkNavy font-bold px-3 py-1 rounded-md text-sm">
                        {message.shortcut}
                      </span>
                      {activeCategory === 'All' && (
                        <span className="text-xs text-gray-400 bg-darkNavy px-2 py-1 rounded">
                          {message.category || 'General'}
                        </span>
                      )}
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
        </div>

        {/* Modal Overlay for MessageForm */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-darkGrey rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-700">
              <h2 className="text-2xl text-gold font-bold mb-6">
                {editingMessage ? 'Edit Shortcut' : 'Add New Shortcut'}
              </h2>
              <MessageForm 
                initialData={editingMessage}
                categories={categories}
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