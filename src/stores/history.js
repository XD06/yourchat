import { defineStore } from 'pinia'
import { useChatStore } from './chat'

export const useHistoryStore = defineStore('history', {
    state: () => ({
        // Array of chat history records
        records: [],
        // ID of the active history record, 'current' means the current session
        activeRecordId: 'current',
    }),

    getters: {
        /**
         * Get a specific chat history record by ID
         */
        getRecordById: (state) => (id) => {
            return state.records.find(record => record.id === id)
        },

        /**
         * Get all chat history records sorted by timestamp (newest first)
         */
        getAllRecords: (state) => {
            return [...state.records].sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp)
            })
        },
        
        /**
         * Check if a specific chat history record exists
         */
        hasRecord: (state) => (id) => {
            return state.records.some(record => record.id === id)
        },
        
        /**
         * Get the active record ID
         */
        activeId: (state) => {
            return state.activeRecordId
        },
        
        /**
         * Check if we are in the current session
         */
        isCurrentSession: (state) => {
            return state.activeRecordId === 'current'
        }
    },

    actions: {
        /**
         * Add a new chat history record
         */
        addRecord(record) {
            // Check if record with the same ID already exists
            const existingIndex = this.records.findIndex(r => r.id === record.id)
            
            if (existingIndex !== -1) {
                // Update existing record
                this.records[existingIndex] = {
                    ...this.records[existingIndex],
                    ...record,
                    timestamp: new Date().toISOString() // Update timestamp
                }
            } else {
                // Add new record
                this.records.push({
                    ...record,
                    timestamp: record.timestamp || new Date().toISOString()
                })
            }
        },
        
        /**
         * Update an existing chat history record
         */
        updateRecord(id, updates, updateTimestamp = true) {
            const index = this.records.findIndex(record => record.id === id)
            if (index !== -1) {
                this.records[index] = {
                    ...this.records[index],
                    ...updates,
                    ...(updateTimestamp ? { timestamp: new Date().toISOString() } : {})
                }
                return true
            }
            return false
        },
        
        /**
         * Delete a chat history record
         */
        deleteRecord(id) {
            const index = this.records.findIndex(record => record.id === id)
            if (index !== -1) {
                this.records.splice(index, 1)
                
                // If the deleted record was active, switch to current session
                if (this.activeRecordId === id) {
                    this.setActiveRecord('current')
                }
                return true
            }
            return false
        },
        
        /**
         * Save the current chat session as a new history record
         */
        saveCurrentAsHistory(title) {
            const chatStore = useChatStore()
            
            // Skip if there are no messages
            if (chatStore.messages.length === 0) {
                return null
            }
            
            // Create a new record ID
            const recordId = `history_${Date.now()}`
            
            // Create a deep copy of the messages to prevent reference issues
            const messagesCopy = JSON.parse(JSON.stringify(chatStore.messages))
            
            // Create the new record
            const newRecord = {
                id: recordId,
                title: title || this.generateTitleFromMessages(chatStore.messages),
                messages: messagesCopy,
                timestamp: new Date().toISOString(),
                tokenCount: { ...chatStore.tokenCount }
            }
            
            // Add the record to the history
            this.addRecord(newRecord)
            
            return recordId
        },
        
        /**
         * Set the active history record
         */
        setActiveRecord(id) {
            // Don't do anything if already active
            if (id === this.activeRecordId) {
                console.log('[HistoryStore] Already active record:', id);
                return;
            }

            const chatStore = useChatStore();
            console.log('[HistoryStore] Switching from', this.activeRecordId, 'to', id);

            // Scenario 1: Switching TO a history record (from 'current' or another history record)
            if (id !== 'current') {
                const record = this.getRecordById(id);
                if (record) {
                    // If we were in the 'current' session and it has messages, 
                    // save its state to localStorage['currentChat'].
                    // This ensures that if the user switches back to 'current' later, 
                    // they can resume what they left off with.
                    if (this.activeRecordId === 'current' && chatStore.messages.length > 0) {
                        console.log('[HistoryStore] Saving current session before switching to history');
                        localStorage.setItem('currentChat', JSON.stringify(chatStore.messages));
                    }
                    
                    // First set the activeRecordId to ensure any watch effects know we're changing mode
                    this.activeRecordId = id;
                    
                    // Load the history record's messages into the chat store with a deep copy
                    console.log('[HistoryStore] Loading history record:', record.title);
                    chatStore.setMessages(JSON.parse(JSON.stringify(record.messages)));
                    return true;
                }
                console.log('[HistoryStore] Record not found:', id);
                return false; // Record not found
            }
            // Scenario 2: Switching TO the 'current' session (from a history record)
            else {
                // First set the activeRecordId to ensure any watch effects know we're changing mode
                this.activeRecordId = 'current';
                
                // Check if localStorage has currentChat item
                const savedCurrentChat = localStorage.getItem('currentChat');
                
                if (savedCurrentChat) {
                    try {
                        // Attempt to load messages from localStorage with a deep copy
                        const savedMessages = JSON.parse(savedCurrentChat);
                        if (savedMessages && savedMessages.length > 0) {
                            console.log('[HistoryStore] Loading saved current session from localStorage');
                            chatStore.setMessages(JSON.parse(JSON.stringify(savedMessages)));
                        } else {
                            console.log('[HistoryStore] Saved current session is empty, clearing messages');
                            chatStore.clearMessages();
                        }
                    } catch (e) {
                        console.error('[HistoryStore] Failed to load current chat from localStorage:', e);
                        chatStore.clearMessages(); // Clear on error
                    }
                } else {
                    // No saved current chat, so clear messages for a fresh start
                    console.log('[HistoryStore] No saved current session, clearing messages');
                    chatStore.clearMessages();
                }
                return true;
            }
        },
        
        /**
         * Generate a title from the first few messages
         */
        generateTitleFromMessages(messages) {
            // Get the first user message
            const firstUserMessage = messages.find(m => m.role === 'user')
            
            if (firstUserMessage) {
                // Extract the first line or first N characters
                let title = firstUserMessage.content.split('\n')[0].trim()
                
                // Limit title length
                if (title.length > 50) {
                    title = title.substring(0, 47) + '...'
                }
                
                return title
            }
            
            // Fallback title
            return '对话 ' + new Date().toLocaleString()
        },
        
        /**
         * Clear all history records
         */
        clearAllRecords() {
            this.records = []
            this.activeRecordId = 'current'
        },

        /**
         * Debug state of the history store
         */
        debugState() {
            console.group('🔍 History Store Debug');
            console.log('Active Record ID:', this.activeRecordId);
            console.log('Is Current Session:', this.isCurrentSession);
            console.log('Records Count:', this.records.length);
            console.log('Records:', this.records.map(r => ({
                id: r.id,
                title: r.title,
                messageCount: r.messages?.length || 0,
                timestamp: r.timestamp
            })));
            console.groupEnd();
            return true;
        }
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'chat-history-records',
                storage: localStorage,
            },
        ],
    },
}) 