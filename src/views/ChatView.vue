<template>
    <!-- 添加动态类以控制侧边栏状态 -->
    <div class="chat-view-container" :class="{ 'sidebar-collapsed': !isSidebarOpen && !isMobileView, 'mobile-sidebar-active': isMobileSidebarOpen }">
        <!-- 左侧垂直图标栏 (PC端显示) -->
        <div class="icon-sidebar" v-if="!isMobileView">
            <div class="icon-item main-icon">
                <el-avatar :size="36" class="blue-avatar" style="background-color: transparent;">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50">
<path fill="white" d="M 25 1 A 2.5 2.5 0 0 0 22.509766 3.2851562 L 7.2539062 12.119141 A 2.5 2.5 0 0 0 6.5 12 A 2.5 2.5 0 0 0 5 16.498047 L 5 33.503906 A 2.5 2.5 0 0 0 6.5 38 A 2.5 2.5 0 0 0 7.2558594 37.882812 L 22.513672 46.716797 A 2.5 2.5 0 0 0 25 49 A 2.5 2.5 0 0 0 27.490234 46.714844 L 42.746094 37.880859 A 2.5 2.5 0 0 0 43.5 38 A 2.5 2.5 0 0 0 45 33.501953 L 45 16.496094 A 2.5 2.5 0 0 0 43.5 12 A 2.5 2.5 0 0 0 42.744141 12.117188 L 27.486328 3.2832031 A 2.5 2.5 0 0 0 25 1 z M 22.265625 5.7402344 L 15.130859 18.128906 L 8.9960938 14.578125 A 2.5 2.5 0 0 0 8.8027344 13.533203 L 22.265625 5.7402344 z M 27.734375 5.7402344 L 41.197266 13.533203 A 2.5 2.5 0 0 0 41.001953 14.580078 L 34.869141 18.128906 L 27.734375 5.7402344 z M 8.1347656 16.390625 L 14.134766 19.865234 L 15.136719 18.134766 L 23.519531 22.990234 C 23.939531 22.690234 24.45 22.5 25 22.5 C 25.55 22.5 26.060469 22.690234 26.480469 22.990234 L 34.863281 18.134766 L 35.865234 19.865234 L 41.867188 16.390625 A 2.5 2.5 0 0 0 43 16.947266 L 43 32.253906 L 35.869141 19.869141 L 27.470703 24.720703 C 27.480703 24.820703 27.5 24.91 27.5 25 C 27.5 26.02 26.88 26.899062 26 27.289062 L 26 37 L 40.275391 37 L 26.822266 44.789062 A 2.5 2.5 0 0 0 26 44.210938 L 26 37 L 24 37 L 24 44.210938 A 2.5 2.5 0 0 0 23.177734 44.789062 L 9.7246094 37 L 24 37 L 24 27.289062 C 23.12 26.899062 22.5 26.02 22.5 25 C 22.5 24.91 22.519297 24.820703 22.529297 24.720703 L 14.130859 19.869141 L 7 32.253906 L 7 16.949219 A 2.5 2.5 0 0 0 8.1347656 16.390625 z"></path>
</svg>
                    <!-- <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" class="h-2/3 w-2/3 text-black dark:text-white"><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg> -->
                </el-avatar>
            </div>
            <div class="icon-item">
                <el-icon><ChatRound /></el-icon>
            </div>
            <div class="icon-item">
                <el-icon><Refresh /></el-icon>
            </div>
           
            <div class="icon-item">
                <el-icon><Setting /></el-icon>
            </div>
            <!-- 添加暗黑模式切换按钮 -->
            <div class="icon-item dark-mode-toggle" :class="{'dark-mode-active': settingsStore.isDarkMode}" @click="toggleDarkMode">
                <div class="toggle-icon-wrapper">
                    <svg v-if="settingsStore.isDarkMode" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#FFD43B" stroke="#FFD43B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#FFB020" stroke="#FFB020" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </div>
            </div>
            <!-- 添加收起/展开侧边栏的按钮 -->
            <div class="icon-item" @click="toggleSidebar">
                <el-icon>
                    <Fold v-if="isSidebarOpen" />
                    <Expand v-else />
                </el-icon>
            </div>
            <div class="icon-item" style = "background-color: grey; border-radius: 100%;height: 25px;width: 25px;">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
</svg>
            </div>
            <div class="icon-item bottom-icon">
                <el-icon><User /></el-icon>
            </div>
        
        </div>
        
        <!-- 左侧边栏 - 重新设计，模仿截图风格 -->
        <div class="sidebar" :class="{'sidebar-open-mobile': isMobileSidebarOpen}">
            <!-- 顶部搜索区域 -->
            <div class="sidebar-header">
                <div class="app-title">
                    <div class="mac-controls">
                        <span class="mac-btn mac-close"></span>
                        <span class="mac-btn mac-minimize"></span>
                        <span class="mac-btn mac-expand"></span>
                    </div>
                </div>
                <el-input
                    placeholder="Search"
                    prefix-icon="Search"
                    size="small"
                    class="search-input"
                />
                <div class="new-chat-wrapper">
                    <el-button type="primary" @click="handleNewChat" class="new-chat-btn" dark>
                        <el-icon><Plus /></el-icon>
                        <span>New Chat</span>
                        <el-icon><Edit /></el-icon>
                    </el-button>
                </div>
            </div>
            
            <!-- 收藏的聊天 -->
            <div class="saved-chats">
                <div class="sidebar-label">
                    <el-icon><Star /></el-icon>
                    <span>Saved</span>
                </div>
                <div class="chat-item saved" @click="handleChatItemClick('saved')">
                    <div class="chat-icon" style="background-color: #6366f1;">C</div>
                    <span class="chat-title">ChatAI</span>
                    <el-button class="more-btn" type="text">
                        <el-icon><MoreFilled /></el-icon>
                    </el-button>
                </div>
            </div>
            
            <!-- 按日期分组的历史聊天 -->
            <div class="history-group">
                <div class="sidebar-label">
                    <span>Today</span>
                    <el-icon class="expand-icon"><ArrowDown /></el-icon>
                </div>
                
                <!-- 当前会话 -->
                <div class="chat-item" 
                     :class="{ 'active': activeHistoryId === 'current' }" 
                     @click="handleChatItemClick('current')">
                    <div class="chat-icon" style="background-color: #06b6d4;">
                        <el-icon><ChatRound /></el-icon>
                    </div>
                    <span class="chat-title">{{ currentChatTitle }}</span>
                    <el-button class="more-btn" type="text">
                        <el-icon><MoreFilled /></el-icon>
                    </el-button>
                </div>
                
                <!-- 历史会话 - 过滤掉当前活跃的会话 -->
                <template v-if="chatHistory.length > 0">
                    <div v-for="chat in chatHistory.filter(c => c.id !== activeHistoryId)" 
                        :key="chat.id" 
                        class="chat-item"
                        :class="{ 'active': activeHistoryId === chat.id }"
                        @click="handleChatItemClick(chat.id)"
                    >
                        <div class="chat-icon" :style="{ backgroundColor: getRandomColor(chat.id) }">
                            {{ chat.title.charAt(0) }}
                        </div>
                        <span class="chat-title">{{ chat.title }}</span>
                        <el-button 
                            class="more-btn" 
                            type="text"
                            @click.stop="handleDeleteChat(chat.id)"
                        >
                            <el-icon><MoreFilled /></el-icon>
                        </el-button>
                    </div>
                </template>
                <div v-else class="empty-history">
                    <p>No saved conversations yet</p>
                </div>
            </div>
        </div>

        <!-- 移动端遮罩层 -->
        <div class="mobile-sidebar-overlay" :class="{active: isMobileSidebarOpen}" @click="toggleMobileSidebar"></div>

        <!-- 右侧主聊天区域 -->
        <div class="main-chat-area">
            <!-- 聊天头部 - 重新设计，更简洁 -->
            <div class="chat-header">
                <!-- 移动端汉堡按钮 -->
                <el-button class="mobile-menu-button" @click="toggleMobileSidebar" :icon="Menu" text circle v-if="isMobileView"></el-button>
                
                <!-- 左侧模型信息和状态区域 -->
                <div class="header-left">
                    <!-- 模型信息和设置 -->
                    <div class="model-status">
                        <div class="status-indicator online"></div>
                        <span class="status-text">Online</span>
                    </div>
                    
                    <el-dropdown trigger="click" @command="handleModelChange">
                        <div class="model-info" style="cursor: pointer;">
                            <span class="model-name">{{ getModelDisplayName() }}</span>
                            <el-tag type="success" size="small" effect="dark" class="model-tag">Active</el-tag>
                            <el-icon class="model-dropdown-icon"><ArrowDown /></el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item 
                                    v-for="model in modelOptions" 
                                    :key="model.value" 
                                    :command="model.value"
                                    :class="{ 'is-active': settingsStore.model === model.value }"
                                >
                                    {{ model.label }}
                                    <el-icon v-if="settingsStore.model === model.value"><Check /></el-icon>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                
                <!-- 中间标题区域 - 只在PC显示 -->
                <div class="header-center" v-if="!isMobileView">
                    <div class="conversation-info">
                        <span class="conversation-title">{{ currentChatTitle || 'New Chat' }}</span>
                        <div class="conversation-stats">
                            <span class="stats-item">
                                <el-icon><ChatDotRound /></el-icon>
                                {{ messages.length }} messages
                            </span>
                            <span class="stats-divider">•</span>
                            <span class="stats-item">
                                <el-icon><Clock /></el-icon>
                                {{ formatTimestamp() }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧功能按钮 -->
                <div class="header-actions">
                    <el-button class="action-btn theme-btn" type="default" @click="toggleDarkMode" title="Toggle Dark Mode">
                        <el-icon><Moon v-if="settingsStore.isDarkMode" /><Sunny v-else /></el-icon>
                    </el-button>
                    
                    <el-button class="config-btn" type="default" @click="toggleSettings">
                        <span class="button-text">Settings</span>
                        <el-icon><Setting /></el-icon>
                    </el-button>
                    
                    <el-button class="share-btn" type="default" @click="handleShare">
                        <span class="button-text">Share</span>
                        <el-icon><Share /></el-icon>
                    </el-button>
                    
                    <el-dropdown trigger="click">
                        <el-button class="action-btn" type="primary">
                            <span class="button-text">New</span>
                            <el-icon><Plus /></el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="handleNewChat">
                                    <el-icon><ChatRound /></el-icon> New Chat
                                </el-dropdown-item>
                                <el-dropdown-item @click="handleRefresh">
                                    <el-icon><Refresh /></el-icon> Refresh
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            
            <!-- 消息容器 -->
            <div class="messages-container" ref="messagesContainer">
                <template v-if="messages.length">
                    <chat-message v-for="message in messages" :key="message.id" :message="message"
                                @update="handleMessageUpdate" @delete="handleMessageDelete" @regenerate="handleRegenerate" />
                </template>
                <div v-else class="empty-state">
                    <div class="welcome-container">
                        <el-avatar :size="60" class="blue-avatar"style = "background:transparent">
                    <svg width="60" color = "black"  height="60" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" class="h-2/3 w-2/3 text-black dark:text-white"><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg>
                </el-avatar>
                        <h1 class="welcome-title">Hi, there 👋</h1>
                        <p class="welcome-subtitle">Tell us what you need, and we'll handle the rest.</p>
                        
                        <!-- 任务卡片区域 -->
                        <div class="task-cards">
                            <div class="task-card">
                                <div class="task-card-avatar">
                                    <el-avatar :size="36" style="background-color: #444;">S</el-avatar>
                                </div>
                                <div class="task-card-content">
                                    <div class="task-card-header">Data Assistant</div>
                                    <div class="task-card-description">
                                        Designed to help manage sales processes and maximize customer engagement.
                                    </div>
                                </div>
                            </div>
                            
                            <div class="task-suggestions">
                                <div class="task-item">
                                    <el-icon><Document /></el-icon>
                                    <span>Answer RFP documentation</span>
                                </div>
                                <div class="task-item">
                                    <el-icon><DataAnalysis /></el-icon>
                                    <span>Conduct a competitor analysis</span>
                                </div>
                                <div class="task-item">
                                    <el-icon><Message /></el-icon>
                                    <span>Provide feedback on communication</span>
                                </div>
                                
                                <div class="task-footer">
                                    <span>Tasks</span>
                                    <el-button type="text">View All</el-button>
                                </div>
                            </div>
                            
                            <div class="prompt-suggestion">
                                <div class="prompt-header">
                                    <div class="prompt-text">What are the key benefits of Product 1 that I should highlight to potential clients?</div>
                                    <el-button type="text" class="prompt-more">
                                        <el-icon><MoreFilled /></el-icon>
                                    </el-button>
                                </div>
                                <div class="prompt-footer">Suggested prompt</div>
                            </div>
                        </div>
                        
                        <!-- 快速操作按钮 -->
                        <div class="quick-actions">
                            <el-button class="action-button">
                                <el-icon><Calendar /></el-icon>
                                Connect Calendar
                            </el-button>
                            <el-button class="action-button">
                                <el-icon><TrendCharts /></el-icon>
                                Demo Task
                            </el-button>
                            <el-button class="action-button">
                                <el-icon><Connection /></el-icon>
                                Browse Integrations
                            </el-button>
                            <el-button class="action-button">
                                <el-icon><Notebook /></el-icon>
                                Shared in Notes
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 聊天输入框 -->
            <chat-input 
                ref="chatInputRef"
                :loading="isLoading" 
                @send="handleSend"
                @clear="handleClear"
                @role-selected="handleRoleSelected"
                @pause="handlePauseGeneration"
                class="modern-chat-input"
            />
            
            <!-- 底部免责声明 -->
            <!-- <div class="disclaimer">
                Centra may display inaccurate info, so please double check the response. 
                <el-link type="primary">Your Privacy & Orbita GPT</el-link>
            </div> -->
        </div>

        <!-- 设置对话框 -->
        <el-dialog
            v-model="showSettings"
            title="Settings"
            width="420px"
            :close-on-click-modal="false"
            :show-close="true"
            destroy-on-close
            class="settings-dialog"
        >
            <el-form :model="settingsForm" label-position="top" class="settings-form">
                <!-- Removing dark mode section -->
                <!-- <el-divider content-position="left">Appearance</el-divider>
                <el-form-item label="Dark Mode">
                    <el-switch
                        v-model="settingsStore.isDarkMode"
                        @change="handleDarkModeChange"
                    />
                </el-form-item> -->
                
                <el-divider content-position="left">Model Configuration</el-divider>
                <el-form-item label="Model">
                    <el-select v-model="settingsForm.model" class="w-full">
                        <el-option
                            v-for="model in modelOptions"
                            :key="model.value"
                            :label="model.label"
                            :value="model.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="System Prompt">
                    <el-input
                        v-model="settingsForm.systemPrompt"
                        type="textarea"
                        :rows="3"
                        placeholder="设置默认的系统提示词（可选）"
                    />
                    <div class="form-item-tip">
                        系统提示词将作为指令发送给AI，不会显示在对话中
                    </div>
                </el-form-item>
                <el-form-item label="Temperature">
                    <el-slider
                        v-model="settingsForm.temperature"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        show-input
                    />
                </el-form-item>
                <el-form-item label="Max Tokens">
                    <el-input-number
                        v-model="settingsForm.maxTokens"
                        :min="1"
                        :max="4096"
                        :step="1"
                    />
                </el-form-item>
                <el-form-item label="Top P">
                    <el-slider
                        v-model="settingsForm.topP"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        show-input
                    />
                </el-form-item>
                <el-form-item label="Top K">
                    <el-input-number
                        v-model="settingsForm.topK"
                        :min="1"
                        :max="100"
                        :step="1"
                    />
                </el-form-item>
                
                <el-divider content-position="left">API Credentials</el-divider>
                <el-form-item label="API Key" required>
                    <el-input
                        v-model="settingsForm.apiKey"
                        type="password"
                        show-password
                        placeholder="Enter your API Key"
                        :class="{ 'is-error': !settingsStore.actualApiKey }"
                    />
                    <div class="form-item-tip" v-if="!settingsStore.actualApiKey">
                        API Key is required - either enter here or set in environment variables
                    </div>
                    <div class="form-item-tip">
                        <strong>Your custom settings will be used instead of environment variables.</strong><br/>
                        Custom API Keys entered here are not saved to browser storage for security.
                        You'll need to re-enter them if the app is refreshed.
                    </div>
                </el-form-item>
                
                <el-form-item label="API Endpoint">
                    <el-input
                        v-model="settingsForm.apiEndpoint"
                        placeholder="API Endpoint URL"
                    />
                    <div class="form-item-tip">
                        Default: https://api.openai.com/v1/chat/completions
                    </div>
                    <div class="form-item-tip">
                        <strong>Your custom endpoint will be used instead of environment variables.</strong><br/>
                        Custom endpoints are not saved to browser storage for security.
                    </div>
                    <el-button 
                        type="primary" 
                        size="small" 
                        class="parse-models-btn" 
                        @click="parseModels"
                        :loading="isParsingModels"
                    >
                        Parse Available Models
                    </el-button>
                </el-form-item>
                
                <el-form-item label="Stream Response">
                    <el-switch
                        v-model="settingsForm.streamResponse"
                    />
                    <div class="form-item-tip">Show AI responses in real-time</div>
                </el-form-item>
                
                <el-form-item label="当前角色提示词" v-if="settingsStore.currentRole">
                    <div class="current-role-info">
                        <div class="role-name">{{ settingsStore.currentRole.name }}</div>
                        <div class="role-prompt">{{ settingsStore.currentRole.prompt }}</div>
                        <el-button 
                            type="text" 
                            @click="clearCurrentRole" 
                            size="small"
                        >
                            清除当前角色
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showSettings = false">Cancel</el-button>
                    <el-button type="primary" @click="saveSettings">
                        Save
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import { useSettingsStore } from '../stores/settings'
import { ElMessageBox, ElMessage } from 'element-plus'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'
import { ArrowDown, Menu, Check, ArrowLeft, Setting, Plus, Edit, Star, Search, MoreFilled, ChatRound, Share, User, Fold, Expand, Refresh, ChatDotRound, Clock, Moon, Sunny } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
// 导入 messageHandler 用于处理消息
import { messageHandler } from '../utils/messageHandler'
import { fetchModelList } from '../stores/settings'

// 状态管理
const chatStore = useChatStore()
const settingsStore = useSettingsStore()

// 移动端检测 - 改进检测方法
const isMobileView = ref(window.innerWidth <= 768)
const isMobileSidebarOpen = ref(false)

// 监听窗口大小变化来改变移动端视图状态
const handleResize = () => {
    isMobileView.value = window.innerWidth <= 768
    
    // 当从移动端切换到桌面端时，确保sidebar正确显示
    if (!isMobileView.value) {
        isMobileSidebarOpen.value = false
    }
}

// 移动端侧边栏切换
const toggleMobileSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
    // 添加/移除body的overflow以防止背景滚动
    if (isMobileSidebarOpen.value) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
}

// 添加窗口大小变化监听
onMounted(() => {
    window.addEventListener('resize', handleResize)
    // 初始检测
    handleResize()
})

// 移除监听
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    // 确保body overflow被还原
    document.body.style.overflow = ''
})

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const messagesContainer = ref(null)

// 添加一个更新触发器，用于强制更新模型列表
const modelOptionsLastUpdated = ref(Date.now())

// 添加模型选项的计算属性，以确保下拉菜单始终显示最新数据
const modelOptions = computed(() => {
    // 依赖 modelOptionsLastUpdated 以确保在值更新时重新计算
    const _ = modelOptionsLastUpdated.value;
    return settingsStore.modelOptions;
})

// 侧边栏状态
const isSidebarOpen = ref(true) // 默认打开

// 设置面板状态
const showSettings = ref(false)
const isParsingModels = ref(false)

// 添加本地表单状态对象，用于处理设置表单的数据
const settingsForm = ref({
    apiKey: '',
    apiEndpoint: '',
    model: '',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.7,
    topK: 50,
    streamResponse: true,
    systemPrompt: ''
})

// 当设置面板打开时，初始化表单数据
const initSettingsForm = () => {
    settingsForm.value = {
        apiKey: settingsStore.displayApiKey,
        apiEndpoint: settingsStore.displayApiEndpoint,
        model: settingsStore.model,
        temperature: settingsStore.temperature,
        maxTokens: settingsStore.maxTokens,
        topP: settingsStore.topP,
        topK: settingsStore.topK,
        streamResponse: settingsStore.streamResponse,
        systemPrompt: settingsStore.systemPrompt
    }
}

// 监听设置面板的显示状态，打开时初始化表单
watch(() => showSettings.value, (newValue) => {
    if (newValue) {
        initSettingsForm()
    }
})

// 聊天历史记录
const chatHistory = ref([])
const currentChatTitle = ref('新对话')
// 追踪当前活跃的历史记录ID
const activeHistoryId = ref('current')

// 用于中断请求的控制器 - 确保它在全局作用域中定义
const activeController = ref(null);

// 保存聊天历史到localStorage
const saveChatHistory = () => {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory.value))
}

// 发送消息方法
const handleSend = async (content) => {
  console.log('[ChatView] handleSend received content:', content ? content.substring(0, 50) + '...' : '(empty)');
  
  if (!content || !content.trim()) {
    console.warn('[ChatView] handleSend received empty content. Aborting.');
    return;
  }

//   if (isLoading.value) { 
//     console.warn('[ChatView] handleSend aborted: isLoading is true.');
//     return;
//   }
  
  // 检查API Key - 使用 actualApiKey
  console.log('[ChatView] Checking API Key...', settingsStore.actualApiKey ? 'Exists' : 'Missing');
  if (!settingsStore.actualApiKey) {
    ElMessage.error('请在设置中配置有效的API Key');
    showSettings.value = true;
    console.log('[ChatView] handleSend aborted: Missing API Key.');
    return;
  }
  
  try {
    console.log('[ChatView] Adding user message to store...');
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    chatStore.addMessage(userMessage);
    console.log('[ChatView] User message added:', userMessage);
    
    console.log('[ChatView] Adding placeholder assistant message...');
    // 添加一个空的AI回复消息
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      completed: false
    };
    // 注意：直接修改 computed 属性 messages.value 是不推荐的
    // 需要通过 store 的 action 来添加消息
    chatStore.messages.push(assistantMessage); // 临时修复，最好用 action
    console.log('[ChatView] Placeholder assistant message added:', assistantMessage);
    
    console.log('[ChatView] Saving messages...');
    // 保存消息
    saveMessages();
    
    console.log('[ChatView] Scrolling to bottom...');
    // 在下一个DOM更新周期滚动到底部
    await nextTick();
    scrollToBottom();
    
    chatStore.isLoading = true;
    console.log('[ChatView] isLoading set to true');
    
    // 准备发送给API的消息
    const apiMessages = prepareMessagesForAPI();
    console.log('[ChatView] Preparing API messages:', apiMessages);
    
    const endpoint = settingsStore.actualApiEndpoint || 'https://api.openai.com/v1/chat/completions';
    console.log(`[ChatView] Calling messageHandler.sendMessage with endpoint: ${endpoint}`);
    
    // 调用API发送消息并获取响应messageHandler.sendMessage
    let result = { success: false };
    try {
      result = await messageHandler.sendMessage(
        apiMessages,
        settingsStore.actualApiKey,
        endpoint,
        {
          model: settingsStore.model,
          temperature: settingsStore.temperature,
          max_tokens: settingsStore.maxTokens
        },
        (updatedContent, done) => {
          // 这个回调应该在 messageHandler.sendMessage 内部被调用
          //console.log(`[ChatView] onUpdate callback: done=${done}`);
          
          // 确保找到最后一条助手消息并更新它
          const lastMessage = chatStore.messages[chatStore.messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // 如果updatedContent是对象，表示包含内容和思考内容
            if (typeof updatedContent === 'object') {
              if (updatedContent.content !== undefined) {
                lastMessage.content = updatedContent.content;
              //  console.log('[ChatView] 更新助手消息内容:', updatedContent.content.substring(0, 50) + '...');
              }
              if (updatedContent.thinkingContent !== undefined) {
                lastMessage.thinkingContent = updatedContent.thinkingContent;
              //  console.log('[ChatView] 更新思考内容:', updatedContent.thinkingContent.substring(0, 50) + '...');
              }
            } else if (updatedContent && updatedContent.length > 0) {
              // 兼容旧版本，直接更新内容
              lastMessage.content = updatedContent;
            //  console.log('[ChatView] 更新助手消息内容:', updatedContent.substring(0, 50) + '...');
            }
          } else {
            console.error('[ChatView] 找不到要更新的助手消息');
          }
          
          if (done) {
           // console.log('[ChatView] onUpdate: Message generation complete.');
            // 确保找到最后一条助手消息并标记为已完成
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.completed = true;
              
              // 更新token计数 (这个逻辑可能需要移到 store action)
              const promptTokens = messageHandler.countTokens(apiMessages.filter(m => m.role !== 'assistant').map(m => m.content).join(''));
              const completionTokens = messageHandler.countTokens(typeof updatedContent === 'object' ? updatedContent.content || '' : updatedContent || '');
              chatStore.updateTokenCount(promptTokens, completionTokens);
              saveMessages(); // 保存最终消息
            }
          }
        }
      );
    } catch (apiError) {
      console.error('[ChatView] API错误:', apiError);
      ElMessage.error(`API错误: ${apiError.message || '未知错误'}`);
      // 移除最后添加的助手消息
      chatStore.messages.pop();
      chatStore.isLoading = false;
      return;
    }
    
    // 保存controller以便可能的中断
    activeController.value = result.controller;
    
    if (!result.success && !result.aborted) {
      console.error('[ChatView] API call failed or was not aborted.');
      ElMessage.error('获取AI回复时出错');
      // 考虑移除失败的 assistantMessage
      chatStore.messages.pop(); // 移除最后添加的空消息
      saveMessages();
    }
    
    chatStore.isLoading = false;
    console.log('[ChatView] isLoading set to false');
    if (!result.aborted) {
      activeController.value = null;
      console.log('[ChatView] activeController reset to null');
    }
  } catch (error) {
    console.error('[ChatView] Error in handleSend:', error);
    ElMessage.error('发送消息失败: ' + error.message);
    chatStore.isLoading = false;
    activeController.value = null;
    // 考虑移除失败的 assistantMessage
    const lastMsg = chatStore.messages[chatStore.messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.completed) {
      chatStore.messages.pop();
      saveMessages();
    }
  }
};

/**
 * 清除消息处理函数
 */
const handleClear = () => {
    chatStore.clearMessages()
}

// 处理消息更新 (重新生成时不再调用此方法，需要评估是否仍需要)
const handleMessageUpdate = async (updatedMessage) => {
    console.warn('[handleMessageUpdate] invoked. Consider if this logic is still needed after regeneration changes.');
    const index = chatStore.messages.findIndex(m => m.id === updatedMessage.id)
    if (index !== -1 && index > 0 && chatStore.messages[index - 1]?.role === 'user') {
        console.log(`[handleMessageUpdate] User message at index ${index - 1} updated. Triggering regeneration.`);
        if (index + 1 < chatStore.messages.length && chatStore.messages[index + 1]?.role === 'assistant') {
             await handleRegenerate(chatStore.messages[index + 1]);
        } else {
             console.log(`[handleMessageUpdate] No assistant message found after index ${index}. Sending as new.`);
             chatStore.messages.splice(index + 1);
             await handleSend(updatedMessage.content);
        }
    } else if (index === 0 && updatedMessage.role === 'user'){
         console.log(`[handleMessageUpdate] First user message updated. Sending as new.`);
         chatStore.messages.splice(1); // 删除之后所有
         await handleSend(updatedMessage.content);
    }
}

// 处理消息删除
const handleMessageDelete = (messageToDelete) => {
    const index = chatStore.messages.findIndex(m => m.id === messageToDelete.id);
    if (index !== -1) {
        console.log(`[handleMessageDelete] Deleting message at index ${index}`);
        if (messageToDelete.role === 'user' && index + 1 < chatStore.messages.length && chatStore.messages[index + 1].role === 'assistant') {
            console.log(`   Also deleting assistant message at index ${index + 1}`);
            chatStore.messages.splice(index, 2);
        } else {
            chatStore.messages.splice(index, 1);
        }
    }
}

// 处理重新生成
const handleRegenerate = async (messageToRegenerate) => {
    console.log('[Regenerate] Starting regeneration for message:', JSON.parse(JSON.stringify(messageToRegenerate)));

    if (messageToRegenerate.role !== 'assistant') {
        console.error('[Regenerate] Error: Only assistant messages can be regenerated.');
        return;
    }

    const assistantMessageIndex = chatStore.messages.findIndex(m => m.id === messageToRegenerate.id);
    if (assistantMessageIndex === -1) {
        console.error(`[Regenerate] Error: Could not find message with ID ${messageToRegenerate.id} in the store.`);
        return;
    }
    console.log(`[Regenerate] Found assistant message at index: ${assistantMessageIndex}`);
    const messageIdToDelete = messageToRegenerate.id; 

    // if (chatStore.isLoading) {
    //     console.warn('[Regenerate] Aborted: Already loading.');
    //     ElMessage.warning('请等待当前消息处理完成');
    //     return;
    // }

    // 如果有活动的请求，先中止
    if (activeController.value) {
        console.log('[Regenerate] Aborting existing request');
        activeController.value.abort();
        activeController.value = null;
    }

    // 找到前一个用户消息
    let userMessageIndex = -1;
    for (let i = assistantMessageIndex - 1; i >= 0; i--) {
        if (chatStore.messages[i]?.role === 'user') {
            userMessageIndex = i;
            break;
        }
    }
    console.log(`[Regenerate] Found preceding user message at index: ${userMessageIndex}`);

    if (userMessageIndex === -1) {
        console.error(`[Regenerate] Error: No preceding user message found for AI message at index ${assistantMessageIndex}.`);
        ElMessage.warning('无法重新生成，因为在此之前没有找到用户提问。');
        return;
    }

    try {
        chatStore.isLoading = true;

        // 删除要重新生成的消息
        chatStore.messages = chatStore.messages.filter(m => m.id !== messageIdToDelete); 

        // 准备上下文消息
        const apiMessages = prepareMessagesForAPI();
        
        console.log('[Regenerate] API Messages:', apiMessages);
        
        // 临时调试：检查消息格式
        if (apiMessages.length === 0) {
            console.error('[Regenerate] 错误: 准备的API消息为空');
            ElMessage.error('消息准备失败: 消息为空');
            chatStore.isLoading = false;
            return;
        }

        // 添加新的空助手消息
        const newAssistantMessage = {
            id: Date.now(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            completed: false
        };
        chatStore.messages.push(newAssistantMessage);
        
        // 初始化变量，避免引用错误
        let result = { success: false, controller: null, aborted: false };
        
        // 调用API发送消息并获取响应 - 使用 actualApiKey 和 actualApiEndpoint
        try {
            result = await messageHandler.sendMessage(
                apiMessages,
                settingsStore.actualApiKey,
                settingsStore.actualApiEndpoint || 'https://api.openai.com/v1/chat/completions',
                {
                    model: settingsStore.model,
                    temperature: settingsStore.temperature,
                    max_tokens: settingsStore.maxTokens
                },
                (updatedContent, done) => {
                    // 更新最新的AI消息内容
                   // console.log(`[Regenerate] onUpdate callback: done=${done}`);
                    
                    // 确保找到最后一条助手消息并更新它
                    const lastMessage = chatStore.messages[chatStore.messages.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                        // 如果updatedContent是对象，表示包含内容和思考内容
                        if (typeof updatedContent === 'object') {
                            if (updatedContent.content !== undefined) {
                                lastMessage.content = updatedContent.content;
                             //   console.log('[Regenerate] 更新助手消息内容:', updatedContent.content.substring(0, 50) + '...');
                            }
                            if (updatedContent.thinkingContent !== undefined) {
                                lastMessage.thinkingContent = updatedContent.thinkingContent;
                              //      console.log('[Regenerate] 更新思考内容:', updatedContent.thinkingContent.substring(0, 50) + '...');
                            }
                        } else if (updatedContent && updatedContent.length > 0) {
                            // 兼容旧版本，直接更新内容
                            lastMessage.content = updatedContent;
                         //   console.log('[Regenerate] 更新助手消息内容:', updatedContent.substring(0, 50) + '...');
                        }
                    } else {
                        console.error('[Regenerate] 找不到要更新的助手消息');
                    }
                    
                    if (done) {
                     //   console.log('[Regenerate] onUpdate: Message generation complete.');
                        // 确保找到最后一条助手消息并标记为已完成
                        const lastMessage = chatStore.messages[chatStore.messages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.completed = true;
                            
                            // 更新token计数
                            const promptTokens = messageHandler.countTokens(apiMessages.filter(m => m.role !== 'assistant').map(m => m.content).join(''));
                            const completionTokens = messageHandler.countTokens(typeof updatedContent === 'object' ? updatedContent.content || '' : updatedContent || '');
                            chatStore.updateTokenCount(promptTokens, completionTokens);
                            saveMessages(); // 保存最终消息
                        }
                    }
                }
            );
        } catch (apiError) {
            console.error('[Regenerate] API错误:', apiError);
            ElMessage.error(`API错误: ${apiError.message || '未知错误'}`);
            // 移除最后添加的助手消息
            chatStore.messages.pop();
            chatStore.isLoading = false;
            return;
        }
        
        // 保存controller以便可能的中断
        activeController.value = result.controller;
        
        if (!result.success && !result.aborted) {
            ElMessage.error('重新生成失败，请稍后重试');
            // 移除空消息
            chatStore.messages = chatStore.messages.filter(m => m.id !== newAssistantMessage.id);
        }
        
        chatStore.isLoading = false;
        if (!result.aborted) {
            activeController.value = null;
        }
    } catch (error) {
        console.error('[Regenerate] Error:', error);
        ElMessage.error('重新生成过程中发生错误：' + error.message);
        chatStore.isLoading = false;
        activeController.value = null;
        
        // 移除可能存在的空助手消息
        const lastMessage = chatStore.messages[chatStore.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.completed) {
            chatStore.messages.pop();
        }
    }
};

// 处理会话项点击
const handleChatItemClick = (chatId) => {
  console.log(`Clicked on chat: ${chatId}`);
  if (chatId === 'current') {
    // 当前对话，什么都不做
    return;
  }
  
  // 保存当前对话到历史记录，如果有意义的内容
  if (chatStore.messages.length > 1) {
    // 检查当前对话是否已经在历史记录中
    const currentChatStr = JSON.stringify(chatStore.messages);
    const existingChatIndex = chatHistory.value.findIndex(
      chat => JSON.stringify(chat.messages) === currentChatStr
    );
    
    // 如果当前对话不在历史记录中，则保存它
    if (existingChatIndex === -1) {
      saveCurrentChatToHistory();
    }
  }
  
  // 加载选择的历史对话
  loadChatHistory(chatId);
}

// 新增：将当前聊天保存到历史记录中
const saveCurrentChatToHistory = () => {
  if (chatStore.messages.length === 0) return;
  
  // 为当前聊天创建一个ID和标题
  const chatId = `chat_${Date.now()}`;
  
  // 使用第一条用户消息作为标题
  const firstUserMsg = chatStore.messages.find(m => m.role === 'user');
  const title = firstUserMsg 
    ? (firstUserMsg.content.length > 20 
        ? firstUserMsg.content.substring(0, 20) + '...' 
        : firstUserMsg.content)
    : '未命名对话';
  
  // 检查是否存在标题相同的历史记录，避免视觉上的重复
  const similarTitleIndex = chatHistory.value.findIndex(chat => chat.title === title);
  
  // 如果存在相同标题的，且不是当前正在查看的聊天，则更新它而不是创建新的
  if (similarTitleIndex !== -1) {
    // 更新已有记录
    chatHistory.value[similarTitleIndex] = {
      ...chatHistory.value[similarTitleIndex],
      messages: JSON.parse(JSON.stringify(chatStore.messages)),
      updatedAt: new Date().toISOString()
    };
  } else {
    // 添加到历史记录中
    chatHistory.value.unshift({
      id: chatId,
      title,
      messages: JSON.parse(JSON.stringify(chatStore.messages)),
      createdAt: new Date().toISOString()
    });
  }
  
  // 保存到localStorage
  saveChatHistory();
}

// 新增：处理刷新按钮点击
const handleRefresh = () => {
    console.log('刷新聊天');
    ElMessage.info('刷新聊天功能已触发');
    // 简单实现：清空消息列表
    handleClear();
}

// 新增：处理分享按钮点击
const handleShare = () => {
    console.log('分享聊天');
    
    if (messages.value.length === 0) {
        ElMessage.warning('没有可分享的内容');
        return;
    }
    
    // 模拟分享功能
    try {
        const chatContent = messages.value.map(m => 
            `[${m.role}]: ${m.content}`
        ).join('\n\n');
        
        navigator.clipboard.writeText(chatContent)
            .then(() => {
                ElMessage.success('对话内容已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
                ElMessage.error('分享失败，无法复制内容');
            });
    } catch (error) {
        console.error('分享错误:', error);
        ElMessage.error('分享功能出错');
    }
}

// 处理暂停消息生成
const handlePauseGeneration = () => {
  console.log('尝试暂停生成, activeController:', activeController.value);
  
  if (activeController.value) {
    console.log('暂停生成');
    // 中止当前的fetch请求
    activeController.value.abort();
    activeController.value = null;
    chatStore.isLoading = false;
    
    // 如果有最后一条消息，标记为已完成
    if (chatStore.messages.length > 0) {
      const lastMessage = chatStore.messages[chatStore.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.completed = true;
        lastMessage.content += '\n\n[生成已暂停]';
      }
    }
  } else {
    console.log('无法暂停: 没有活动的controller');
  }
};

// 滚动到底部的辅助函数
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 处理角色选择
const handleRoleSelected = (role) => {
  console.log('选择角色:', role);
  // 存储当前选择的角色到设置中
  settingsStore.currentRole = {
    name: role.name,
    prompt: role.prompt
  };
  // 不需要重新发送消息，只需要更新系统状态
  ElMessage.success(`已设置角色: ${role.name}`);
}

// 准备发送给API的消息
const prepareMessagesForAPI = () => {
  // 创建消息数组的副本
  const apiMessages = [];
  
  // 添加系统提示词（如果有）
  if (settingsStore.currentRole?.prompt) {
    // 优先使用当前角色的提示词
    apiMessages.push({
      role: 'system',
      content: settingsStore.currentRole.prompt
    });
  } else if (settingsStore.systemPrompt) {
    // 如果没有角色提示词，但有系统提示词设置，使用系统提示词
    apiMessages.push({
      role: 'system',
      content: settingsStore.systemPrompt
    });
  }
  
  // 添加所有的用户和助手消息
  messages.value.forEach(msg => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      apiMessages.push({
        role: msg.role,
        content: msg.content
      });
    }
  });
  
  return apiMessages;
}

// 清除当前角色
const clearCurrentRole = () => {
  settingsStore.currentRole = null;
  ElMessage.success('已清除当前角色设置');
}

// 自动保存消息到localStorage
const saveMessages = () => {
  localStorage.setItem('currentChat', JSON.stringify(chatStore.messages));
}

// 修改自动保存当前聊天记录方法，使用统一的saveCurrentChatToHistory
const autoSaveCurrentChat = () => {
  saveCurrentChatToHistory();
}

// 新建聊天
const handleNewChat = () => {
  // 仅当有消息且不是空对话时才保存
  if (chatStore.messages.length > 1) {
    // 检查是否已经在历史记录中
    const existingChatIndex = chatHistory.value.findIndex(
      chat => JSON.stringify(chat.messages) === JSON.stringify(chatStore.messages)
    );
    
    if (existingChatIndex === -1) {
      saveCurrentChatToHistory();
    }
  }
  
  // 清空当前消息
  chatStore.clearMessages();
  currentChatTitle.value = '新对话';
  activeHistoryId.value = 'current'; // 重置活跃ID为当前
  ElMessage.success('已新建对话');
}

// 加载历史对话
const loadChatHistory = (chatId) => {
  const chat = chatHistory.value.find(c => c.id === chatId)
  if (chat) {
    chatStore.setMessages(JSON.parse(JSON.stringify(chat.messages)))
    currentChatTitle.value = chat.title
    activeHistoryId.value = chatId // 设置当前活跃的历史记录ID
    ElMessage.success(`已加载对话: ${chat.title}`)
  }
}

// 删除历史对话
const handleDeleteChat = (chatId) => {
  const indexToDelete = chatHistory.value.findIndex(chat => chat.id === chatId)
  if (indexToDelete !== -1) {
    const chatToDelete = chatHistory.value[indexToDelete]
    ElMessage.success(`已删除对话: ${chatToDelete.title}`)
    chatHistory.value.splice(indexToDelete, 1)
    
    // 如果删除的是当前活跃的历史记录，则重置为current
    if (activeHistoryId.value === chatId) {
      activeHistoryId.value = 'current'
      chatStore.clearMessages()
      currentChatTitle.value = '新对话'
    }
    
    saveChatHistory()
  }
}

// 切换侧边栏函数
const toggleSidebar = () => {
  // 这个函数现在主要用于PC端的侧边栏折叠
  if (!isMobileView.value) {
    isSidebarOpen.value = !isSidebarOpen.value;
    showSettings.value = false; // 收起边栏时关闭设置面板
  } else {
    // 移动端调用新的toggleMobileSidebar
    toggleMobileSidebar();
  }
};

// 切换设置面板
const toggleSettings = () => {
  showSettings.value = !showSettings.value
  console.log('Settings dialog toggled:', showSettings.value)
}

// 保存设置
const saveSettings = () => {
  const customApiKey = settingsForm.value.apiKey;
  const customApiEndpoint = settingsForm.value.apiEndpoint;
  
  // 检查是否有自定义值
  const hasCustomValues = customApiKey || customApiEndpoint;
  
  // 验证API Key
  if (!customApiKey && !settingsStore.actualApiKey) {
    ElMessage.warning('API Key is required for the application to work');
    return;
  }
  
  // 保存所有设置到 store
  settingsStore.temperature = settingsForm.value.temperature;
  settingsStore.maxTokens = settingsForm.value.maxTokens;
  settingsStore.model = settingsForm.value.model;
  settingsStore.topP = settingsForm.value.topP;
  settingsStore.topK = settingsForm.value.topK;
  settingsStore.streamResponse = settingsForm.value.streamResponse;
  settingsStore.systemPrompt = settingsForm.value.systemPrompt;
  
  // 强制刷新模型选择器显示
  modelOptionsLastUpdated.value = Date.now();
  
  if (hasCustomValues) {
    // 用户提供了自定义值，启用自定义API
    settingsStore.setCustomAPI(customApiKey, customApiEndpoint);
    ElMessage.success('已保存自定义API设置');
  } else if (settingsStore.userCustomizedAPI) {
    // 用户清空了自定义值，回退到环境变量
    settingsStore.clearCustomAPI();
    ElMessage.success('已恢复使用环境变量API设置');
  } else {
    // 没有变化，只是保存其他设置
    ElMessage.success('设置已保存');
  }
  
  // 保存设置后关闭对话框
  showSettings.value = false;
}

const handleDarkModeChange = (value) => {
  settingsStore.isDarkMode = value
}

// 监听消息变化，自动保存
watch(messages, () => {
  saveMessages();
  
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// 在组件挂载时加载保存的消息
onMounted(() => {
  // 加载保存的聊天历史
  const savedHistory = localStorage.getItem('chatHistory');
  if (savedHistory) {
    try {
      chatHistory.value = JSON.parse(savedHistory);
    } catch (e) {
      console.error('加载聊天历史失败:', e);
      chatHistory.value = [];
    }
  }
  
  // 加载当前聊天
  const savedCurrentChat = localStorage.getItem('currentChat');
  if (savedCurrentChat) {
    try {
      const savedMessages = JSON.parse(savedCurrentChat);
      if (savedMessages.length > 0) {
        chatStore.setMessages(savedMessages);
      }
    } catch (e) {
      console.error('加载当前聊天失败:', e);
    }
  }
});

// 移除保存按钮相关的函数，改为自动保存
// 保存当前对话 - 这个方法不再需要，但保留以便手动触发
const saveCurrentChat = () => {
  autoSaveCurrentChat();
}

// 获取模型显示名称
const getModelDisplayName = () => {
    // 强制模型选项刷新的依赖项
    const _ = modelOptionsLastUpdated.value;
    const model = settingsStore.model;
    const option = settingsStore.modelOptions.find(opt => opt.value === model);
    return option ? option.label : 'AI Chat';
}

// 为聊天项生成随机颜色
const getRandomColor = (id) => {
    const colors = [
        '#4284f5', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#ef4444'
    ];
    // 使用id作为种子，确保同一id总是得到相同的颜色
    const index = parseInt(id.toString().slice(-5)) % colors.length;
    return colors[index];
}

// 处理模型变更
const handleModelChange = (modelValue) => {
  // 设置新选择的模型
  settingsStore.model = modelValue;
  // 同步更新设置表单中的模型
  if (settingsForm.value) {
    settingsForm.value.model = modelValue;
  }
  // 刷新模型显示
  modelOptionsLastUpdated.value = Date.now();
  ElMessage.success(`模型已切换为: ${getModelDisplayName()}`);
}

// 添加模型解析功能
const parseModels = async () => {
    if (!settingsForm.value.apiKey && !settingsStore.actualApiKey) {
        ElMessage.warning('请先填写API Key');
        return;
    }
    
    if (!settingsForm.value.apiEndpoint && !settingsStore.actualApiEndpoint) {
        ElMessage.warning('请先填写API Endpoint');
        return;
    }
    
    isParsingModels.value = true;
    
    try {
        const apiKey = settingsForm.value.apiKey || settingsStore.actualApiKey;
        const apiEndpoint = settingsForm.value.apiEndpoint || settingsStore.actualApiEndpoint;
        
        const modelsList = await fetchModelList(
            apiEndpoint,
            apiKey
        );
        
        console.log('Fetched models:', modelsList);
        
        if (modelsList.length > 0) {
            // 使用store的action添加新模型，传入true作为第二个参数以清除现有模型
            const addedCount = settingsStore.addModels(modelsList, true);
            
            // 更新本地表单中的模型列表
            modelOptionsLastUpdated.value = Date.now();
            
            // 如果当前选择的模型在新模型列表中不存在，则设置为第一个可用模型
            if (!modelsList.includes(settingsForm.value.model)) {
                settingsForm.value.model = modelsList[0];
            }
            
            ElMessage.success(`成功解析到 ${modelsList.length} 个模型，已更新模型列表`);
        } else {
            ElMessage.info('未解析到任何模型，请检查API接口是否正确');
        }
    } catch (error) {
        console.error('解析模型失败:', error);
        ElMessage.error(`解析模型失败！检查网络连通性重试`);
    } finally {
        isParsingModels.value = false;
    }
}

// 处理暗黑模式切换
const toggleDarkMode = () => {
  settingsStore.toggleDarkMode();
};

// 格式化时间戳
const formatTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}
</script>

<style lang="scss" scoped>
/* 整体容器结构 */
.chat-view-container {
    display: flex;
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial);
    background-color: var(--bg-color, #f3f4f6);
    
    &.sidebar-collapsed {
        .icon-sidebar {
            // 保持原样
        }
        
        .sidebar {
            width: 0;
            padding: 0;
            overflow: hidden;
        }
        
        .main-chat-area {
            width: calc(100% - 52px); // 只减去图标栏的宽度
        }
    }
}

// 移动端侧边栏遮罩
.mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 190; // 低于侧边栏，高于其他内容
    display: none;
    
    &.active {
        display: block; // 激活时显示
        animation: fadeIn 0.3s ease;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 主聊天区域样式 */
.main-chat-area {
    flex-grow: 1;
    width: calc(100% - 332px); // 总宽度减去侧边栏(280px)和图标栏(52px)
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: width 0.3s ease;
    
    @media (max-width: 768px) {
        width: 100%; // 移动端占满全屏
        height: 100vh; // 明确设置高度
        margin-left: 0; // 移除左边距，确保全屏显示
    }
}

/* 聊天内容区域 */
.chat-content {
    flex-grow: 1;
    height: calc(100% - 135px); // 留出头部和输入区域的空间
    overflow-y: auto;
    padding: 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    
    // 自定义滚动条
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }
    
    &:hover::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3);
    }
    
    @media (max-width: 768px) {
        padding: 1rem 0.75rem; // 移动端减小内边距，增加可用宽度
        height: calc(100% - 120px); // 调整移动端高度
    }
}

/* 聊天消息区域 */
.message-list {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px; // 限制最大宽度，保持可读性
    margin: 0 auto; // 居中显示
    width: 100%; // 占满可用空间
    
    @media (max-width: 768px) {
        max-width: 100%; // 移动端占满宽度
        margin: 0; // 移除边距，充分利用空间
    }
}

// 聊天输入区域
.modern-chat-input {
    padding: 0.75rem 1.5rem 1.5rem;
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    
    @media (max-width: 768px) {
        padding: 0.5rem 0.75rem 1rem; // 减小内边距
        max-width: 100%; // 移动端占满宽度
    }
}

/* 垂直图标栏 */
.icon-sidebar {
    width: 60px;
    background-color: #202123;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
    // 移动端隐藏图标栏，后续可通过按钮控制显示
    @media (max-width: 768px) {
        display: none; 
    }
    
    .icon-item {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        margin-bottom: 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
            background-color: #2d2d33;
            color: #fff;
        }
        
        &.main-icon {
            margin-bottom: 24px;
        }
        
        &.bottom-icon {
            margin-top: auto;
            margin-bottom: 0;
        }
        
        &.dark-mode-toggle {
            background-color: #2a2a30;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            
            .toggle-icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            }
            
            .moon-icon, .sun-icon {
                filter: drop-shadow(0 0 2px rgba(255, 212, 59, 0.6));
            }
            
            &:hover {
                transform: scale(1.1);
                box-shadow: 0 0 8px rgba(255, 212, 59, 0.5);
            }
            
            &:after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, rgba(255,212,59,0.2) 0%, rgba(255,212,59,0) 70%);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            &:hover:after {
                opacity: 1;
            }
            
            // Styles specific to dark mode active state
            &.dark-mode-active {
                background-color: #363640;
            }
        }
        
        .blue-avatar {
            background-color: white;
        }
    }
}

/* 侧边栏样式 */
.sidebar {
    width: 280px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e7eb;
    overflow: hidden;
    transition: width 0.3s ease; // 添加过渡效果

    // 移动端隐藏侧边栏，后续可通过按钮控制显示
    @media (max-width: 768px) {
        position: fixed; // 改为fixed，使其可以覆盖内容
        left: -280px; // 默认隐藏在左侧
        top: 0;
        bottom: 0;
        height: 100%;
        z-index: 200; // 比聊天输入框高，比可能的遮罩层低
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        &.sidebar-open-mobile {
            left: 0; // 打开时滑入
        }
    }
    
    /* 侧边栏头部 */
    .sidebar-header {
        padding: 16px;
        
        .app-title {
            margin-bottom: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            
            .mac-controls {
                display: flex;
                gap: 8px;
                
                .mac-btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    cursor: default;
                }
                
                .mac-close {
                    background-color: #ff5f56;
                }
                
                .mac-minimize {
                    background-color: #ffbd2e;
                }
                
                .mac-expand {
                    background-color: #27c93f;
                }
            }
        }
        
        .search-input {
            margin-bottom: 16px;
            
            :deep(.el-input__wrapper) {
                background-color: #f5f5f5;
                border-radius: 8px;
                box-shadow: none;
                padding: 6px 12px;
            }
            
            :deep(.el-input__inner) {
                font-size: 14px;
            }
        }
        
        .new-chat-wrapper {
            .new-chat-btn {
                width: 100%;
                border-radius: 8px;
                background-color: #202123;
                border: none;
                padding: 10px 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                
                &:hover {
                    background-color: #353740;
                }
            }
        }
    }

    /* 侧边栏分组 */
    .saved-chats, .history-group {
        padding: 0 16px;
        
        .sidebar-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            
            .expand-icon {
                margin-left: auto;
                font-size: 12px;
                transition: transform 0.2s;
                
                &.collapsed {
                    transform: rotate(-90deg);
                }
            }
        }
    }
    
    .saved-chats {
        margin-bottom: 24px;
    }
}

/* 聊天项目 */
.chat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
    margin-bottom: 4px;
    position: relative;
    
    .chat-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        flex-shrink: 0;
    }
    
    .chat-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .more-btn {
        opacity: 0;
        transition: opacity 0.2s;
        padding: 2px;
        
        .el-icon {
            font-size: 16px;
            color: #666;
        }
    }
    
    &:hover {
        background-color: #f0f2f5;
        
        .more-btn {
            opacity: 1;
        }
    }
    
    &.active {
        background-color: #e6f4ff;
        color: #1677ff;
        font-weight: 500;
    }
}

/* 聊天头部 */
.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    border-bottom: 1px solid #eaeaea;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    position: relative;
    z-index: 10;
    
    // 暗黑模式
    [data-theme="dark"] & {
        background-color: #202123;
        border-bottom-color: #333;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    // 移动端样式
    @media (max-width: 768px) {
        padding: 10px 12px;
    }

    .mobile-menu-button {
        display: none; // 默认隐藏
        @media (max-width: 768px) {
            display: inline-flex; // 移动端显示
            margin-right: 10px;
        }
    }
    
    // 左侧区域
    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .model-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #666;
            
            [data-theme="dark"] & {
                color: #aaa;
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                
                &.online {
                    background-color: #10b981;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                    animation: pulse 2s infinite;
                }
                
                &.offline {
                    background-color: #ef4444;
                }
                
                &.busy {
                    background-color: #f59e0b;
                }
            }
            
            .status-text {
                font-weight: 500;
            }
        }
    }
    
    // 中间标题区域
    .header-center {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        max-width: 40%;
        text-align: center;
        
        .conversation-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .conversation-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
                
                [data-theme="dark"] & {
                    color: #e0e0e0;
                }
            }
            
            .conversation-stats {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #666;
                
                [data-theme="dark"] & {
                    color: #aaa;
                }
                
                .stats-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    
                    .el-icon {
                        font-size: 12px;
                    }
                }
                
                .stats-divider {
                    color: #d1d5db;
                    
                    [data-theme="dark"] & {
                        color: #555;
                    }
                    margin-top: -2px;
                }
            }
        }
    }
    
    .model-info {
        display: flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 6px;
        transition: background-color 0.2s;
        background-color: #f9f9f9;
        
        [data-theme="dark"] & {
            background-color: #2d2d33;
        }
        
        &:hover {
            background-color: #f0f2f5;
            
            [data-theme="dark"] & {
                background-color: #383842;
            }
        }
        
        .model-name {
            font-size: 15px;
            font-weight: 500;
            color: #333;
            
            [data-theme="dark"] & {
                color: #e0e0e0;
            }
        }
        
        .model-tag {
            margin-left: 8px;
            height: auto;
            padding: 2px 8px;
            font-size: 11px;
        }
        
        .model-dropdown-icon {
            margin-left: 6px;
            font-size: 12px;
            color: #909399;
            
            [data-theme="dark"] & {
                color: #aaa;
            }
        }
    }
    
    .header-actions {
        display: flex;
        gap: 8px;
        
        .config-btn, .share-btn, .action-btn {
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            color: #333;
            margin-left: 0px;
            
            [data-theme="dark"] & {
                background-color: #2d2d33;
                border-color: #444;
                color: #e0e0e0;
            }
            
            &:hover {
                background-color: #f0f2f5;
                
                [data-theme="dark"] & {
                    background-color: #383842;
                }
            }
            
            .el-icon {
                font-size: 14px;
            }
        }

        .theme-btn {
            padding: 8px 8px;
            transition: transform 0.3s;
            
            &:hover {
                transform: rotate(15deg);
            }
            
            [data-theme="dark"] & .el-icon {
                color: #FFD43B;
            }
        }
        
        .action-btn[type="primary"] {
            background-color: #4284f5;
            border-color: #4284f5;
            color: white;
            
            &:hover {
                background-color: #3472dc;
                border-color: #3472dc;
            }
            
            [data-theme="dark"] & {
                background-color: #4284f5;
                border-color: #3470db;
            }
        }
        
        @media (max-width: 768px) {
            gap: 4px; // 减小按钮间距
            
            .config-btn, .share-btn, .action-btn {
                padding: 8px !important; // 减小内边距
                min-width: 36px !important; // 确保按钮不会太小
                margin-left: 0px;
                
                // 移动端隐藏按钮文字，只显示图标
                .button-text {
                    display: none;
                }
                
                // 调整图标大小
                .el-icon {
                    font-size: 16px;
                    margin: 0;
                }
            }
        }
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}

/* 消息区域 */
.messages-container {
    flex: 1; // 占据剩余空间
    overflow-y: auto;
    padding: 16px 8px 20px; // 底部留出一些空间，但主要由输入框高度决定
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center; // Center child items horizontally
    
    @media (max-width: 768px) {
        padding: 12px 8px 10px;
        align-items: stretch; // Full width on mobile
    }

    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
        border-radius: 3px;
    }
    
    .empty-state {
        height: 100%;
        display: flex;
        justify-content: center;
        //padding-top: 80px;
    }
    
    .welcome-container {
        text-align: center;
        max-width: 800px;
        
        // 移动端欢迎页适配
        @media (max-width: 768px) {
            padding: 20px 10px;
            .welcome-title {
                font-size: 28px;
            }
            .welcome-subtitle {
                font-size: 14px;
            }
            .task-cards,
            .quick-actions {
                gap: 8px;
            }
        }
        
        .welcome-avatar {
            background-color: #4284f5;
            font-size: 40px;
            margin-bottom: 24px;
        }
        
        .welcome-title {
            font-size: 36px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #333;
        }
        
        .welcome-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 40px;
        }
        
        /* 任务卡片样式 */
        .task-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 40px;
            
            .task-card, .task-suggestions, .prompt-suggestion {
                flex: 1;
                min-width: 260px;
                background-color: #fafafa;
                border-radius: 12px;
                padding: 16px;
                text-align: left;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                 @media (max-width: 768px) {
                    min-width: calc(50% - 4px); // 移动端一行两个
                    padding: 12px;
                }
            }
            
            .task-card {
                background-color: #202123;
                color: white;
                display: flex;
                gap: 12px;
                
                .task-card-content {
                    .task-card-header {
                        font-weight: 600;
                        margin-bottom: 6px;
                    }
                    
                    .task-card-description {
                        font-size: 13px;
                        opacity: 0.8;
                        line-height: 1.4;
                    }
                }
            }
            
            .task-suggestions {
                display: flex;
                flex-direction: column;
                
                .task-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                    color: #333;
                    
                    .el-icon {
                        color: #666;
                    }
                    
                    &:last-child {
                        border-bottom: none;
                    }
                }
                
                .task-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                    
                    span {
                        font-size: 13px;
                        color: #666;
                    }
                }
            }
            
            .prompt-suggestion {
                .prompt-header {
                    display: flex;
                    
                    .prompt-text {
                        flex: 1;
                        font-size: 14px;
                        line-height: 1.5;
                        color: #333;
                    }
                    
                    .prompt-more {
                        color: #999;
                    }
                }
                
                .prompt-footer {
                    margin-top: 16px;
                    font-size: 13px;
                    color: #666;
                }
            }
        }
        
        /* 快速操作按钮 */
        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-top: 40px;
            
            .action-button {
                border-radius: 20px;
                padding: 8px 16px;
                background-color: #f5f5f7;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                
                &:hover {
                    background-color: #eaeaec;
                }
                
                .el-icon {
                    font-size: 16px;
                    color: #666;
                }
                 @media (max-width: 768px) {
                    font-size: 12px;
                    padding: 6px 12px;
                }
            }
        }
    }
}

/* 聊天输入框 */
.modern-chat-input {
    // 这个类现在主要由 ChatInput.vue 内部控制样式
    // 在 ChatView.vue 中，它会自然地填充 .main-chat-area 的宽度
    // 但我们还是给它一个基本的下边距，尤其是在没有其他内容撑开时
    margin-bottom: 10px; 
    padding-left: 10px; // 左右留一些边距，使其不紧贴边缘
    padding-right: 10px;

    [data-theme="dark"] & {
      // 确保在暗黑模式下，如果 ChatInput.vue 没有设置背景，这里不会有冲突
    }
    
    @media (max-width: 768px) {
        margin-bottom: 0; // 移动端底部通常没有额外边距
        padding-left: 5px;
        padding-right: 5px;
    }
}

/* 免责声明 */
.disclaimer {
    text-align: center;
    font-size: 12px;
    color: #888;
    padding: 12px;
    margin-bottom: 80px;
}

/* 设置对话框样式 */
:deep(.settings-dialog) {
    border-radius: 12px;
    overflow: hidden;
    
    .el-dialog__header {
        padding: 20px;
        margin: 0;
        border-bottom: 1px solid #f0f2f5;
        
        .el-dialog__title {
            font-size: 18px;
            font-weight: 600;
            margin-left: 40%;
        }
    }
    
    .el-dialog__body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
        .el-divider__text.is-left{
        left: 25%;
        }
        
        &::-webkit-scrollbar {
            width: 6px;
        }
        
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.1);
            border-radius: 3px;
        }
    }
    
    .el-dialog__footer {
        padding: 16px 20px;
        border-top: 1px solid #f0f2f5;
    }
    
    .settings-form {
        .el-divider {
            margin: 20px 0 16px;
        }
        
        :deep(.el-form-item) {
            margin-bottom: 16px;
        }
        
        :deep(.el-form-item__label) {
            font-size: 14px;
            color: #555;
        }
        
        .form-item-tip {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            line-height: 1.4;
        }
        
        .w-full {
            width: 100%;
        }
        
        .current-role-info {
            padding: 12px;
            border-radius: 8px;
            background-color: #f9f9f9;
            
            .role-name {
                font-weight: 600;
                margin-bottom: 6px;
                color: #333;
            }
            
            .role-prompt {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
                white-space: pre-wrap;
                line-height: 1.5;
                max-height: 100px;
                overflow-y: auto;
            }
        }
    }
    
    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
}

/* 为随机颜色生成函数 */
@function getRandomColor($id) {
    $colors: (
        #4284f5, #34a853, #fdbc40, #ed5a5a, #8150e4, 
        #f07922, #0097a7, #d32f2f, #039be5, #7cb342
    );
    @return nth($colors, ($id % 10) + 1);
}

/* 暗色模式调整 */
[data-theme="dark"] {
    .chat-view-container {
        background-color: #1a1a1a;
    }
    
    .sidebar {
        background-color: #202123;
        border-color: #333;
        
        .sidebar-header {
            .app-title {
                color: #fff;
                
                .mac-btn {
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset;
                }
            }
            
            .search-input {
                :deep(.el-input__wrapper) {
                    background-color: #2d2d33;
                }
                
                :deep(.el-input__inner) {
                    color: #ddd;
                }
            }
        }
        
        .sidebar-label {
            color: #aaa;
        }
    }
    
    .chat-item {
        color: #ddd;
        
        &:hover {
            background-color: #2d2d33;
        }
        
        &.active {
            background-color: #2d2d33;
            color: #4284f5;
        }
        
        .more-btn .el-icon {
            color: #aaa;
        }
    }
    
    .main-chat-area {
        background-color: #1a1a1a;
    }
    
    .chat-header {
        background-color: #202123;
        border-color: #333;
        
        .model-info .model-name {
            color: #ddd;
        }
        
        .header-actions {
            .config-btn, .share-btn, .action-btn {
                background-color: #2d2d33;
                border-color: #444;
                color: #ddd;
                
                &:hover {
                    background-color: #353740;
                }
            }
        }
    }
    
    .messages-container {
        .welcome-container {
            padding-top:0px;
            .welcome-title {
                color: #ddd;
            }
            
            .welcome-subtitle {
                color: #aaa;
            }
            
            .task-suggestions {
                background-color: #2d2d33;
                
                .task-item {
                    border-color: #444;
                    color: #ddd;
                    
                    .el-icon {
                        color: #aaa;
                    }
                }
                
                .task-footer span {
                    color: #aaa;
                }
            }
            
            .prompt-suggestion {
                background-color: #2d2d33;
                
                .prompt-header .prompt-text {
                    color: #ddd;
                }
                
                .prompt-footer {
                    color: #aaa;
                }
            }
            
            .quick-actions .action-button {
                background-color: #2d2d33;
                color: #ddd;
                
                &:hover {
                    background-color: #353740;
                }
                
                .el-icon {
                    color: #aaa;
                }
            }
        }
    }
    
    .modern-chat-input {
        background-color: #2d2d33;
    }
    
    .disclaimer {
        color: #777;
    }
    
    :deep(.settings-dialog) {
        background-color: #202123;
        
        .el-dialog__header {
            border-color: #333;
        }
        
        .el-dialog__footer {
            border-color: #333;
        }
        
        .settings-form {
            :deep(.el-form-item__label) {
                color: #aaa;
            }
            
            .form-item-tip {
                color: #777;
            }
            
            .current-role-info {
                background-color: #2d2d33;
                
                .role-name {
                    color: #ddd;
                }
                
                .role-prompt {
                    color: #aaa;
                }
            }
        }
    }
}

// 在适当位置添加深度思考的样式
:deep(.chat-message) {
    .thinking-content {
        margin-top: 12px;
        padding: 12px 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        position: relative;
        
        .thinking-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 500;
            color: #666;
            
            .thinking-icon {
                color: #4284f5;
             
            }
        }
        
        .thinking-text {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
            white-space: pre-wrap;
        }
    }
}

:deep(.el-dropdown-menu) {
    .el-dropdown-item.is-active {
        color: #4284f5;
        background-color: #ecf5ff;
    }
    
    [data-theme="dark"] & .el-dropdown-item.is-active {
        color: #4284f5;
        background-color: #2d2d33;
    }
}

.parse-models-btn {
    margin-top: 8px;
    width: 100%;
}
</style>
<!-- <script>
document.querySelector('.toggle-thinking-btn').addEventListener('click', function() {
    var thinkingHeader = document.getElementById('thinking-header');
    thinkingHeader.style.backgroundColor = 'lightblue';  // 修改颜色
  });
</script>    -->