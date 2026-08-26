import { useState, useEffect } from 'react';
import { getAllowedSites, addAllowedSite, removeAllowedSite } from '../services/storage';

const WebsiteManager = () => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState('');

  const fetchSites = async () => {
    const data = await getAllowedSites();
    setSites(data);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;
    
    await addAllowedSite(newSite);
    setNewSite('');
    await fetchSites();
  };

  const handleRemove = async (domain) => {
    await removeAllowedSite(domain);
    await fetchSites();
  };

  return (
    <div className="bg-darkGrey p-6 rounded-xl shadow-md w-full mb-8">
      <h2 className="text-2xl font-bold text-gold mb-2">Allowed Websites</h2>
      <p className="text-gray-300 text-sm mb-4">
        ShortHand will only run and inject shortcuts on the websites listed below.
      </p>
      
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="e.g. zendesk.com"
          className="flex-1 bg-darkNavy text-offWhite border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        />
        <button
          type="submit"
          className="bg-gold text-darkNavy font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Add Site
        </button>
      </form>

      <ul className="flex flex-wrap gap-3">
        {sites.length === 0 ? (
          <li className="text-gray-400 text-sm">No sites configured.</li>
        ) : (
          sites.map((site) => (
            <li key={site} className="flex items-center gap-2 bg-darkNavy px-3 py-1.5 rounded-full border border-gray-600">
              <span className="text-offWhite text-sm font-medium">{site}</span>
              <button
                onClick={() => handleRemove(site)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label={`Remove ${site}`}
              >
                ✕
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default WebsiteManager;

