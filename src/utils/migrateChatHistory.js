/**
 * Utility to migrate chat history from the old format to the new format
 */

/**
 * Migrate from the old chat history format stored in localStorage
 * to the new chat history format using historyStore
 * 
 * @param {Object} historyStore - The history store instance
 * @returns {boolean} - True if migration was done, false if no migration needed
 */
export const migrateFromOldFormat = (historyStore) => {
  // Check if there's old chat history data to migrate
  const savedHistory = localStorage.getItem('chatHistory');
  if (!savedHistory) return false;
  
  try {
    const oldChatHistory = JSON.parse(savedHistory);
    if (!Array.isArray(oldChatHistory) || oldChatHistory.length === 0) return false;
    
    console.log(`Migrating ${oldChatHistory.length} old chat history records to new format...`);
    
    // Migrate each old chat history to the new format
    oldChatHistory.forEach(oldChat => {
      if (!oldChat.id || !oldChat.messages) return;
      
      // Create a new history record in the new format
      const record = {
        id: oldChat.id,
        title: oldChat.title || 'Untitled Chat',
        messages: JSON.parse(JSON.stringify(oldChat.messages)),
        timestamp: oldChat.createdAt || new Date().toISOString(),
        tokenCount: { prompt: 0, completion: 0, total: 0 } // Default token count
      };
      
      // Add the record if it doesn't already exist
      if (!historyStore.hasRecord(record.id)) {
        historyStore.addRecord(record);
      }
    });
    
    console.log('Migration complete. Removing old chat history data.');
    
    // Remove old data after successful migration
    localStorage.removeItem('chatHistory');
    return true;
  } catch (error) {
    console.error('Error migrating old chat history:', error);
    return false;
  }
};

/**
 * Restore the old chat history format from the new format
 * This is a fallback function in case there are issues with the new format
 * 
 * @param {Object} historyStore - The history store instance
 * @returns {boolean} - True if restoration was successful
 */
export const restoreToOldFormat = (historyStore) => {
  try {
    // Convert new format back to old format
    const oldFormat = historyStore.getAllRecords.map(record => ({
      id: record.id,
      title: record.title,
      messages: JSON.parse(JSON.stringify(record.messages)),
      createdAt: record.timestamp
    }));
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(oldFormat));
    console.log('Restored chat history to old format');
    return true;
  } catch (error) {
    console.error('Error restoring to old format:', error);
    return false;
  }
}; 