<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">邮箱生成器设置</h3>
    
    <!-- 邮箱后缀选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择邮箱后缀</label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div 
          v-for="suffix in store.emailSuffixes" 
          :key="suffix.id"
          class="px-3 py-2 border rounded-md cursor-pointer transition-colors relative group"
          :class="[
            suffix.id === store.selectedSuffix 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <div @click="selectSuffix(suffix.id)" class="pr-6 truncate">
            {{ suffix.domain }}
          </div>
          
          <!-- 删除按钮，自定义后缀始终显示，预设后缀悬停时显示 -->
          <button 
            @click.stop="removeSuffix(suffix.id)"
            class="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': suffix.isCustom }"
            title="删除此后缀"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 自定义后缀输入 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">添加自定义后缀</label>
      <div class="flex">
        <input 
          v-model="customDomain" 
          type="text" 
          placeholder="例如: @example.com" 
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          @click="addCustomDomain"
          class="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          添加
        </button>
      </div>
    </div>
    
    <!-- 生成设置 -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">生成设置</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 前缀长度 -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">前缀长度</label>
          <div class="flex items-center">
            <input 
              v-model.number="prefixLength" 
              type="range" 
              min="4" 
              max="16" 
              class="w-full mr-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300 w-8 text-center">{{ prefixLength }}</span>
          </div>
        </div>
        
        <!-- 分隔符 -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">分隔符</label>
          <select 
            v-model="separator"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value=".">点号 (.)</option>
            <option value="_">下划线 (_)</option>
            <option value="-">连字符 (-)</option>
            <option value="">无分隔符</option>
          </select>
        </div>
      </div>
      
      <!-- 选项 -->
      <div class="mt-3 space-y-2">
        <div class="flex items-center">
          <input 
            v-model="includeNumbers" 
            type="checkbox" 
            id="includeNumbers"
            class="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
          />
          <label for="includeNumbers" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            包含数字
          </label>
        </div>
        
        <div class="flex items-center">
          <input 
            v-model="includeSpecialChars" 
            type="checkbox" 
            id="includeSpecialChars"
            class="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
          />
          <label for="includeSpecialChars" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            包含特殊字符
          </label>
        </div>
        
        <div class="flex items-center">
          <input 
            v-model="useWords" 
            type="checkbox" 
            id="useWords"
            class="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
          />
          <label for="useWords" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            使用单词组合
          </label>
        </div>
      </div>
    </div>
    
    <!-- 测试生成 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">测试生成结果</label>
        <button 
          @click="generateTestEmail"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          重新生成
        </button>
      </div>
      
      <div class="flex">
        <input 
          v-model="testEmail" 
          type="text" 
          readonly
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        />
        <button 
          @click="copyEmail"
          class="ml-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          复制
        </button>
      </div>
      <p v-if="copied" class="mt-1 text-sm text-green-600 dark:text-green-400">
        已复制到剪贴板
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEmailGeneratorStore } from '../stores/emailGenerator'

const store = useEmailGeneratorStore()

// 本地状态
const customDomain = ref('')
const testEmail = ref('')
const copied = ref(false)

// 计算属性与双向绑定
const prefixLength = computed({
  get: () => store.generationConfig.prefixLength,
  set: (val) => store.updateGenerationConfig({ prefixLength: val })
})

const includeNumbers = computed({
  get: () => store.generationConfig.includeNumbers,
  set: (val) => store.updateGenerationConfig({ includeNumbers: val })
})

const includeSpecialChars = computed({
  get: () => store.generationConfig.includeSpecialChars,
  set: (val) => store.updateGenerationConfig({ includeSpecialChars: val })
})

const useWords = computed({
  get: () => store.generationConfig.useWords,
  set: (val) => store.updateGenerationConfig({ useWords: val })
})

const separator = computed({
  get: () => store.generationConfig.separator,
  set: (val) => store.updateGenerationConfig({ separator: val })
})

// 方法
const selectSuffix = (id: string) => {
  store.setSelectedSuffix(id)
}

const addCustomDomain = () => {
  if (!customDomain.value) return
  
  try {
    store.addCustomSuffix(customDomain.value)
    customDomain.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : '添加失败')
  }
}

const generateTestEmail = () => {
  const email = store.generateEmail()
  if (email) {
    testEmail.value = email.email
  }
}

const copyEmail = async () => {
  if (!testEmail.value) return
  
  const success = await store.copyToClipboard(testEmail.value)
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const removeSuffix = (id: string) => {
  const suffix = store.emailSuffixes.find(s => s.id === id)
  if (!suffix) return
  
  // 添加确认对话框
  const isConfirmed = confirm(`确定要删除邮箱后缀 "${suffix.domain}" 吗？`)
  if (isConfirmed) {
    store.removeSuffix(id)
  }
}

// 监听配置变化，更新测试邮箱
watch(
  [prefixLength, includeNumbers, includeSpecialChars, useWords, separator],
  () => {
    if (store.canGenerate) {
      generateTestEmail()
    }
  }
)

// 监听选中的后缀变化
watch(
  () => store.selectedSuffix,
  () => {
    if (store.canGenerate) {
      generateTestEmail()
    }
  }
)

// 初始化
onMounted(() => {
  store.initializeStore()
  if (store.canGenerate) {
    generateTestEmail()
  }
})
</script> 