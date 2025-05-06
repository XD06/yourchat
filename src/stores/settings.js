// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 解析环境变量中的模型信息
function parseEnvModels(modelsStr) {
    if (!modelsStr) return [];
    
    return modelsStr.split(',').map(modelInfo => {
        const [value, label] = modelInfo.split(':');
        return {
            label: label || value, // 如果没有指定标签，使用值作为标签
            value: value.trim()
        };
    });
}

// 从环境变量获取默认模型
const defaultModel = import.meta.env.VITE_DEFAULT_MODEL || 'THUDM/GLM-4-9B-0414';

// 以下变量不会暴露在界面上，只在内部使用
const ENV_API_KEY = import.meta.env.VITE_API_KEY || '';
const ENV_API_URL = import.meta.env.VITE_API_URL || 'https://api.openai.com/v1/chat/completions';

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 是否启用深色模式，默认为 false
        isDarkMode: false,
        // 温度参数，控制生成文本的随机性，默认值为 0.7
        temperature: 0.7,
        // 最大 token 数量，默认值为 1000
        maxTokens: 1000,
        // 使用的模型名称 - 从环境变量读取默认值
        model: defaultModel,
        // 用户在界面上输入的API Key，初始为空
        apiKey: '',
        // 用户在界面上输入的API端点，初始为默认值
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        // 标记用户是否自定义了API设置
        userCustomizedAPI: false,
        // 是否启用流式响应，默认为 true
        streamResponse: true,
        // Top P 参数
        topP: 0.7,
        // Top K 参数
        topK: 50,
        // 系统提示词字段
        systemPrompt: '',
        // 当前选择的角色
        currentRole: null,
        // 可用模型选项列表 - 从环境变量读取默认值或使用预设值
        modelOptions: import.meta.env.VITE_MODELS 
            ? parseEnvModels(import.meta.env.VITE_MODELS)
            : [
                { label: 'GLM-Z1-9B', value: 'THUDM/GLM-Z1-9B-0414' },
                { label: 'Qwen3-8B', value: 'Qwen/Qwen3-8B' },
                { label: 'Qwen2.5-Coder-7B', value: 'Qwen/Qwen2.5-Coder-7B-Instruct' },
                { label: 'THUDM/GLM-4-9B-0414', value: 'THUDM/GLM-4-9B-0414' },
                { label: 'DeepSeek-R1-7B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' },
            ],
    }),

    // 计算属性 - 获取实际使用的值
    getters: {
        // 获取实际使用的API Key - 如果用户自定义过则优先使用用户输入值，否则使用环境变量值
        actualApiKey: (state) => state.userCustomizedAPI && state.apiKey ? state.apiKey : (ENV_API_KEY || state.apiKey),
        
        // 获取实际使用的API端点 - 如果用户自定义过则优先使用用户输入值，否则使用环境变量值
        actualApiEndpoint: (state) => state.userCustomizedAPI && state.apiEndpoint ? state.apiEndpoint : (ENV_API_URL || state.apiEndpoint)
    },

    // 定义 store 的动作
    actions: {
        // 切换深色模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // 根据当前的深色模式状态设置 HTML 元素的 data-theme 属性
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        },

        // 更新设置
        updateSettings(settings) {
            // 使用 Object.assign 方法将传入的设置对象合并到当前 store 的状态中
            Object.assign(this.$state, settings)
        },
        
        // 设置自定义 API 凭证
        setCustomAPI(apiKey, apiEndpoint) {
            this.apiKey = apiKey || '';
            this.apiEndpoint = apiEndpoint || 'https://api.openai.com/v1/chat/completions';
            this.userCustomizedAPI = true;
        },
        
        // 添加新模型到选项列表
        addModels(newModels, clearExisting = false) {
            if (clearExisting && newModels.length > 0) {
                // 完全替换现有模型列表
                // 使用新数组而不是修改原数组，以确保 Vue 正确检测到变更
                const newModelOptions = newModels.map(model => ({
                    label: model,
                    value: model
                }));
                this.modelOptions = newModelOptions;
                
                // 如果当前选择的模型不在新列表中，选择第一个模型
                const modelExists = newModels.includes(this.model);
                if (!modelExists && newModels.length > 0) {
                    this.model = newModels[0];
                }
                
                return newModels.length;
            } else {
                // 过滤掉已存在的模型
                const existingValues = this.modelOptions.map(option => option.value);
                const uniqueNewModels = newModels
                    .filter(model => !existingValues.includes(model))
                    .map(model => ({
                        label: model,
                        value: model
                    }));
                    
                // 添加新模型到列表中
                if (uniqueNewModels.length > 0) {
                    // 使用新数组而不是修改原数组
                    this.modelOptions = [...this.modelOptions, ...uniqueNewModels];
                    return uniqueNewModels.length;
                }
                
                return 0;
            }
        }
    },

    // 配置持久化选项
    persist: {
        // 启用持久化功能
        enabled: true,
        // 持久化策略数组
        strategies: [
            {
                // 存储键名
                key: 'ai-chat-settings',
                // 存储方式，这里使用的是 localStorage
                storage: localStorage,
                // 排除敏感信息，只持久化非敏感设置
                paths: ['isDarkMode', 'temperature', 'maxTokens', 'model', 'streamResponse', 'topP', 'topK', 'systemPrompt', 'currentRole', 'modelOptions']
            },
        ],
    },
})

/**
 * @async
 * @function fetchModelList
 * @description Fetches a list of available AI models from an OpenAI-compatible API endpoint.
 * It intelligently handles API endpoint variations, supports GET/POST methods, and includes error handling.
 *
 * @param {string} endpoint - The API endpoint URL. Can be a full URL or a base domain.
 * @param {string} apiKey - The API key for authorization.
 * @param {number} [timeout=5000] - Optional timeout for the request in milliseconds.
 * @returns {Promise<string[]>} A promise that resolves to an array of model names.
 * @throws {Error} Throws an error if the request fails or the response is invalid.
 */
export async function fetchModelList(endpoint, apiKey, timeout = 5000) {
    if (typeof fetch === 'undefined' && typeof require !== 'undefined') {
        global.fetch = require('node-fetch');
    }

    let url = endpoint;

    // 1. 智能补全API地址: 自动添加缺失的协议头
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // 移除末尾可能存在的斜杠，以进行统一处理
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // 核心逻辑：确保最终路径指向 /v1/models 
    // 此函数旨在获取模型列表，因此目标路径应为 OpenAI 兼容的 /models 端点。
    const v1PathSegment = '/v1';
    const modelsPathSegment = '/models';

    const v1Index = url.indexOf(v1PathSegment);

    if (v1Index !== -1) {
        // 如果URL中包含 "/v1"
        // 截取到 "/v1" 部分，然后确保其后是 "/models"
        // 例如: "https://example.com/api/v1/custom" -> "https://example.com/api/v1/models"
        // 例如: "https://example.com/v1" -> "https://example.com/v1/models"
        url = url.substring(0, v1Index + v1PathSegment.length) + modelsPathSegment;
    } else {
        // 如果URL中不包含 "/v1"
        // 直接在末尾追加 "/v1/models"
        // 例如: "https://example.com" -> "https://example.com/v1/models"
        // 例如: "https://example.com/custombase" -> "https://example.com/custombase/v1/models"
        url += v1PathSegment + modelsPathSegment;
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`
    };

    const tryRequest = async (method) => {
        const controller = new AbortController();
        const signal = controller.signal;
        let timer;

        if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
        }

        try {
            timer = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: method,
                headers: headers,
                signal: signal,
                // POST请求通常不需要body来获取模型列表，但如果API需要则应添加
                // body: method === 'POST' ? JSON.stringify({}) : undefined
            });

            clearTimeout(timer);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Ignore if response is not JSON
                }
                const statusText = errorData?.error?.message || response.statusText || 'Unknown error';
                throw new Error(`HTTP error ${response.status}: ${statusText}`);
            }

            const data = await response.json();

            if (!data || !data.data || !Array.isArray(data.data)) {
                throw new Error('Invalid response format: Expected an array of models in data.data');
            }

            return data.data.map(model => model.id).sort();

        } catch (error) {
            clearTimeout(timer);
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeout}ms`);
            }
            throw error; // Re-throw other errors
        }
    };

    try {
        // 优先尝试GET
        return await tryRequest('GET');
    } catch (getError) {
        console.warn(`GET request to ${url} failed: ${getError.message}. Retrying with POST.`);
        try {
            // GET失败后尝试POST
            return await tryRequest('POST');
        } catch (postError) {
            console.error(`POST request to ${url} also failed: ${postError.message}`);
            throw new Error(`Failed to fetch model list from ${url} after trying GET and POST: ${postError.message}`);
        }
    }
}

// 删除示例调用