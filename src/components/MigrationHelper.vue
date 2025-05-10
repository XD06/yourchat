<template>
  <div class="migration-helper" v-if="showMigration">
    <div class="migration-dialog">
      <h3>正在更新聊天历史记录格式</h3>
      <p>我们正在升级聊天历史记录的存储格式，以提高稳定性和可靠性。</p>
      
      <div class="progress-section">
        <div v-if="migrationInProgress" class="migration-progress">
          <el-progress :percentage="migrationProgress" :stroke-width="15" />
          <div class="status-text">{{ statusText }}</div>
        </div>
        <div v-else-if="migrationCompleted" class="migration-completed">
          <div class="success-icon">✓</div>
          <div class="status-text">迁移成功！发现并迁移了 {{ migratedCount }} 条历史记录。</div>
        </div>
        <div v-else-if="migrationFailed" class="migration-failed">
          <div class="error-icon">⚠</div>
          <div class="status-text">迁移过程中遇到问题。{{ errorMessage }}</div>
          <div class="actions">
            <el-button @click="retryMigration" type="primary">重试</el-button>
            <el-button @click="skipMigration">跳过</el-button>
          </div>
        </div>
        <div v-else class="migration-ready">
          <div class="status-text">检测到 {{ oldRecordCount }} 条旧格式的历史记录。</div>
          <div class="actions">
            <el-button @click="startMigration" type="primary">开始迁移</el-button>
            <el-button @click="skipMigration">跳过</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import { migrateFromOldFormat } from '../utils/migrateChatHistory'

const historyStore = useHistoryStore()

const showMigration = ref(false)
const migrationInProgress = ref(false)
const migrationCompleted = ref(false)
const migrationFailed = ref(false)
const migrationProgress = ref(0)
const statusText = ref('准备迁移...')
const errorMessage = ref('')
const oldRecordCount = ref(0)
const migratedCount = ref(0)

// Check if there is chat history to migrate
onMounted(() => {
  checkForOldHistory()
})

const checkForOldHistory = () => {
  const savedHistory = localStorage.getItem('chatHistory')
  if (!savedHistory) {
    showMigration.value = false
    return
  }
  
  try {
    const oldChatHistory = JSON.parse(savedHistory)
    if (!Array.isArray(oldChatHistory) || oldChatHistory.length === 0) {
      showMigration.value = false
      return
    }
    
    // Found old history records
    oldRecordCount.value = oldChatHistory.length
    showMigration.value = true
  } catch (error) {
    console.error('Error checking for old chat history:', error)
    showMigration.value = false
  }
}

const startMigration = async () => {
  migrationInProgress.value = true
  migrationProgress.value = 0
  statusText.value = '开始迁移...'
  
  try {
    // Simulate a progress bar (the actual migration is fast)
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50))
      migrationProgress.value = i
      
      if (i === 20) statusText.value = '读取旧历史记录...'
      if (i === 40) statusText.value = '转换数据格式...'
      if (i === 70) statusText.value = '保存新格式历史记录...'
      if (i === 90) statusText.value = '清理旧数据...'
    }
    
    // Perform actual migration
    const result = migrateFromOldFormat(historyStore)
    
    if (result) {
      migrationCompleted.value = true
      migrationInProgress.value = false
      migratedCount.value = historyStore.getAllRecords.length
    } else {
      throw new Error('迁移过程中出现错误')
    }
  } catch (error) {
    migrationFailed.value = true
    migrationInProgress.value = false
    errorMessage.value = error.message || '未知错误'
    console.error('Migration error:', error)
  }
}

const retryMigration = () => {
  migrationFailed.value = false
  migrationCompleted.value = false
  startMigration()
}

const skipMigration = () => {
  showMigration.value = false
}
</script>

<style scoped>
.migration-helper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.migration-dialog {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
  max-width: 500px;
  width: 90%;
}

.migration-dialog h3 {
  margin-top: 0;
  color: #333;
}

.progress-section {
  margin-top: 20px;
}

.status-text {
  margin: 12px 0;
  color: #666;
}

.actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.success-icon {
  font-size: 48px;
  color: #67C23A;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  color: #F56C6C;
  text-align: center;
}

.migration-progress {
  margin: 24px 0;
}

/* For dark mode */
:deep([data-theme="dark"]) .migration-dialog {
  background-color: #1e1e1e;
  color: #eee;
}

:deep([data-theme="dark"]) .migration-dialog h3 {
  color: #eee;
}

:deep([data-theme="dark"]) .status-text {
  color: #bbb;
}
</style> 