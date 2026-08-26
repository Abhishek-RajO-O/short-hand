const Popup = () => {
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
          <button className="bg-gold text-darkNavy font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Add Message
          </button>
          <button className="bg-darkGrey text-offWhite font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Open Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default Popup;

