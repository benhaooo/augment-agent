<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">邮箱生成器</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          为 AugmentCode 生成随机邮箱，方便多账号登录
        </p>
      </div>

      <!-- 邮箱生成器组件 -->
      <EmailGeneratorSimple />
      
      <!-- 生成历史 -->
      <div v-if="emailStore.lastGeneratedEmail" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近生成的邮箱</h3>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-mono text-lg text-blue-700 dark:text-blue-300 break-all">
                {{ emailStore.lastGeneratedEmail.email }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                生成于: {{ formatDate(emailStore.lastGeneratedEmail.generatedAt) }}
              </p>
            </div>
            <button 
              @click="copyGeneratedEmail" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              复制
            </button>
          </div>
          <p v-if="emailCopied" class="mt-2 text-sm text-green-600 dark:text-green-400">
            已复制到剪贴板
          </p>
        </div>
      </div>
      
      <!-- 清理工具链接 -->
      <div class="mt-8 text-center">
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          需要清理 AugmentCode 数据以使用新邮箱登录？
        </p>
        <router-link 
          to="/" 
          class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          前往清理工具
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmailGeneratorStore } from '../stores/emailGenerator'
import EmailGeneratorSimple from '../components/EmailGeneratorSimple.vue'

// 状态管理
const emailStore = useEmailGeneratorStore()

// 本地状态
const emailCopied = ref(false)

// 复制生成的邮箱
const copyGeneratedEmail = async () => {
  if (emailStore.lastGeneratedEmail) {
    const success = await emailStore.copyToClipboard(emailStore.lastGeneratedEmail.email)
    if (success) {
      emailCopied.value = true
      setTimeout(() => {
        emailCopied.value = false
      }, 2000)
    }
  }
}

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleString()
}

// 初始化
onMounted(() => {
  emailStore.initializeStore()
})
</script>
