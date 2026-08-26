import { useState } from 'react';

const CategorySidebar = ({ categories, activeCategory, onSelectCategory, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onAddCategory(trimmed);
      setNewCategoryName('');
    }
  };

  return (
    <aside className="w-64 flex flex-col bg-darkGrey rounded-xl p-4 shadow-md h-full">
      <h2 className="text-xl font-bold text-gold mb-4 px-2">Categories</h2>
      
      <ul className="flex-1 overflow-y-auto space-y-1 mb-4">
        {/* 'All' is a special virtual category we might want to support, but let's just stick to the actual categories and an 'All' option if needed */}
        <li key="All">
          <button
            onClick={() => onSelectCategory('All')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              activeCategory === 'All' ? 'bg-gold text-darkNavy font-bold' : 'text-offWhite hover:bg-gray-700'
            }`}
          >
            All
          </button>
        </li>
        {categories.map(category => (
          <li key={category} className="group flex items-center justify-between">
            <button
              onClick={() => onSelectCategory(category)}
              className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors truncate ${
                activeCategory === category ? 'bg-gold text-darkNavy font-bold' : 'text-offWhite hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
            {category !== 'General' && (
              <button
                onClick={() => onDeleteCategory(category)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 transition-opacity"
                aria-label={`Delete ${category}`}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-auto border-t border-gray-600 pt-4 flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New Category..."
          className="flex-1 bg-darkNavy text-offWhite border border-gray-600 rounded p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
        />
        <button
          type="submit"
          disabled={!newCategoryName.trim()}
          className="bg-gold text-darkNavy px-3 py-2 rounded font-bold disabled:opacity-50"
        >
          +
        </button>
      </form>
    </aside>
  );
};

export default CategorySidebar;

