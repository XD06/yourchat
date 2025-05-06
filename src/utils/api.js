import { useSettingsStore } from '../stores/settings'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

const createHeaders = () => {
    const settingsStore = useSettingsStore()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settingsStore.actualApiKey}`
    }
}

export const chatApi = {
    async sendMessage(messages, stream = false) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens,
            stream,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
        }

        try {
            console.log(payload);
            const response = await fetch(`${API_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    ...createHeaders(),
                    ...(stream && { 'Accept': 'text/event-stream' })
                },
                body: JSON.stringify(payload),
                mode: 'cors'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
            }

            if (stream) {
                return response
            }

            return await response.json()
        } catch (error) {
            console.error('API Error:', error)
            throw error
        }
    },

    async sendAsyncMessage(messages) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens
        }

        try {
            const response = await fetch(`${API_BASE_URL}/async/chat/completions`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(payload),
                mode: 'cors'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API Error:', error)
            throw error
        }
    },

    async getAsyncResult(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/async-result/${taskId}`, {
                method: 'GET',
                headers: createHeaders(),
                mode: 'cors'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API Error:', error)
            throw error
        }
    }
} 