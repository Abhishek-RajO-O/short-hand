import { useState, useEffect } from 'react';

const MessageForm = ({ initialData, onSubmit, onCancel }) => {
const MessageForm = ({ initialData, onSubmit, onCancel, categories = ['General'] }) => {
  const [shortcut, setShortcut] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');

  // If we pass in existing data (for editing), populate the form
  useEffect(() => {
    if (initialData) {
      setShortcut(initialData.shortcut || '');
      setText(initialData.text || '');
      setCategory(initialData.category || 'General');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedShortcut = shortcut.trim();
    const trimmedText = text.trim();

    // Basic validation
    if (!trimmedShortcut || !trimmedText) {
      setError('Both shortcut and message text are required.');
      return;
    }
    
    if (!trimmedShortcut.startsWith(';') && !trimmedShortcut.startsWith('-')) {
      setError('Shortcut must start with a ";" or "-" (e.g., ;refund).');
      return;
    }

    // Send the data back to Dashboard.jsx
    onSubmit({
      id: initialData?.id || Date.now(), // Keep ID if editing, generate new if creating
      shortcut: trimmedShortcut,
      text: trimmedText,
      category: category,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
      
      <div>
        <label htmlFor="shortcut" className="block text-sm font-medium text-gray-300 mb-1">
          Shortcut Trigger
        </label>
        <input
          type="text"
          id="shortcut"
          value={shortcut}
          onChange={(e) => setShortcut(e.target.value)}
          placeholder="e.g., ;refund"
          className="w-full bg-darkNavy text-offWhite border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">Must start with ; or -</p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-darkNavy text-offWhite border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-1">
          Full Message
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type the full response here..."
          rows="5"
          className="w-full bg-darkNavy text-offWhite border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-y"
        ></textarea>
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t border-gray-600 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-gold text-darkNavy font-bold px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Shortcut'}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;