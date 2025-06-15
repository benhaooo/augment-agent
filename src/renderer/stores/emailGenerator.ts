import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface EmailSuffix {
  id: string
  domain: string
  isCustom: boolean
  isEnabled: boolean
}

export interface GenerationConfig {
  prefixLength: number
  includeNumbers: boolean
  includeSpecialChars: boolean
  useWords: boolean
  separator: string
}

export interface GeneratedEmail {
  email: string
  prefix: string
  suffix: string
  generatedAt: Date
}

export const useEmailGeneratorStore = defineStore('emailGenerator', () => {
  // 状态
  const emailSuffixes = ref<EmailSuffix[]>([])
  const generationConfig = ref<GenerationConfig>({
    prefixLength: 8,
    includeNumbers: true,
    includeSpecialChars: false,
    useWords: false,
    separator: '.',
  })
  const selectedSuffix = ref<string | null>(null)
  const lastGeneratedEmail = ref<GeneratedEmail | null>(null)
  const isGenerating = ref(false)

  // 预设的常用邮箱后缀
  const defaultSuffixes: Omit<EmailSuffix, 'id'>[] = [
    { domain: '@gmail.com', isCustom: false, isEnabled: true },
    { domain: '@outlook.com', isCustom: false, isEnabled: true },
    { domain: '@hotmail.com', isCustom: false, isEnabled: true },
    { domain: '@yahoo.com', isCustom: false, isEnabled: true },
    { domain: '@qq.com', isCustom: false, isEnabled: true },
    { domain: '@163.com', isCustom: false, isEnabled: true },
  ]

  // 计算属性
  const enabledSuffixes = computed(() => 
    emailSuffixes.value.filter(suffix => suffix.isEnabled)
  )

  const selectedSuffixObject = computed(() => 
    emailSuffixes.value.find(suffix => suffix.id === selectedSuffix.value)
  )

  const canGenerate = computed(() => 
    selectedSuffix.value !== null && !isGenerating.value
  )

  // 方法
  const initializeStore = () => {
    // 从本地存储加载数据
    loadFromStorage()
    
    // 如果没有后缀，初始化默认后缀
    if (emailSuffixes.value.length === 0) {
      initializeDefaultSuffixes()
    }
  }

  const initializeDefaultSuffixes = () => {
    emailSuffixes.value = defaultSuffixes.map((suffix, index) => ({
      ...suffix,
      id: `default-${index}`,
    }))
    
    // 默认选择第一个后缀
    if (emailSuffixes.value.length > 0 && !selectedSuffix.value) {
      selectedSuffix.value = emailSuffixes.value[0].id
    }
    
    saveToStorage()
  }

  const addCustomSuffix = (domain: string) => {
    // 验证域名格式
    if (!domain.startsWith('@')) {
      domain = '@' + domain
    }
    
    // 检查是否已存在
    const exists = emailSuffixes.value.some(suffix => suffix.domain === domain)
    if (exists) {
      throw new Error('该邮箱后缀已存在')
    }

    const newSuffix: EmailSuffix = {
      id: `custom-${Date.now()}`,
      domain,
      isCustom: true,
      isEnabled: true,
    }

    emailSuffixes.value.push(newSuffix)
    
    // 自动选择新添加的后缀
    selectedSuffix.value = newSuffix.id
    
    saveToStorage()
    return newSuffix
  }

  const removeSuffix = (id: string) => {
    const index = emailSuffixes.value.findIndex(suffix => suffix.id === id)
    if (index !== -1) {
      emailSuffixes.value.splice(index, 1)
      
      // 如果删除的是当前选中的后缀，重置选择
      if (selectedSuffix.value === id) {
        selectedSuffix.value = emailSuffixes.value.length > 0 ? emailSuffixes.value[0].id : null
      }
      
      saveToStorage()
    }
  }

  const toggleSuffix = (id: string) => {
    const suffix = emailSuffixes.value.find(s => s.id === id)
    if (suffix) {
      suffix.isEnabled = !suffix.isEnabled
      
      // 如果禁用了当前选中的后缀，重置选择
      if (!suffix.isEnabled && selectedSuffix.value === id) {
        const enabledSuffix = emailSuffixes.value.find(s => s.isEnabled)
        selectedSuffix.value = enabledSuffix ? enabledSuffix.id : null
      }
      
      saveToStorage()
    }
  }

  const setSelectedSuffix = (suffixId: string) => {
    const suffix = emailSuffixes.value.find(s => s.id === suffixId && s.isEnabled)
    if (suffix) {
      selectedSuffix.value = suffixId
      saveToStorage()
    }
  }

  const updateGenerationConfig = (config: Partial<GenerationConfig>) => {
    generationConfig.value = { ...generationConfig.value, ...config }
    saveToStorage()
  }

  const generateRandomPrefix = (): string => {
    const config = generationConfig.value
    let characters = 'abcdefghijklmnopqrstuvwxyz'
    
    if (config.includeNumbers) {
      characters += '0123456789'
    }
    
    if (config.includeSpecialChars) {
      characters += '._-'
    }

    if (config.useWords) {
      // 简单的单词组合
      const words = ['user', 'test', 'demo', 'temp', 'mail', 'box', 'dev', 'app']
      const word1 = words[Math.floor(Math.random() * words.length)]
      const word2 = words[Math.floor(Math.random() * words.length)]
      const number = config.includeNumbers ? Math.floor(Math.random() * 1000) : ''
      return `${word1}${config.separator}${word2}${number}`
    }

    let result = ''
    for (let i = 0; i < config.prefixLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    return result
  }

  const generateEmail = (): GeneratedEmail | null => {
    if (!canGenerate.value) {
      return null
    }

    isGenerating.value = true
    
    try {
      const suffix = selectedSuffixObject.value
      
      if (!suffix) return null

      const prefix = generateRandomPrefix()
      const email = prefix + suffix.domain

      const generatedEmail: GeneratedEmail = {
        email,
        prefix,
        suffix: suffix.domain,
        generatedAt: new Date(),
      }

      // 保存最后生成的邮箱
      lastGeneratedEmail.value = generatedEmail
      saveToStorage()
      
      return generatedEmail
    } finally {
      isGenerating.value = false
    }
  }

  // 自动生成邮箱并复制到剪贴板
  const generateAndCopyEmail = async (): Promise<string> => {
    const email = generateEmail()
    if (email) {
      await copyToClipboard(email.email)
      return email.email
    }
    return ''
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  const saveToStorage = () => {
    const data = {
      emailSuffixes: emailSuffixes.value,
      generationConfig: generationConfig.value,
      selectedSuffix: selectedSuffix.value,
      lastGeneratedEmail: lastGeneratedEmail.value,
    }
    localStorage.setItem('emailGenerator', JSON.stringify(data))
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('emailGenerator')
      if (stored) {
        const data = JSON.parse(stored)
        emailSuffixes.value = data.emailSuffixes || []
        generationConfig.value = { ...generationConfig.value, ...data.generationConfig }
        selectedSuffix.value = data.selectedSuffix || null
        
        if (data.lastGeneratedEmail) {
          lastGeneratedEmail.value = {
            ...data.lastGeneratedEmail,
            generatedAt: new Date(data.lastGeneratedEmail.generatedAt),
          }
        }
      }
    } catch (error) {
      console.error('加载存储数据失败:', error)
    }
  }

  const resetToDefaults = () => {
    emailSuffixes.value = []
    selectedSuffix.value = null
    lastGeneratedEmail.value = null
    generationConfig.value = {
      prefixLength: 8,
      includeNumbers: true,
      includeSpecialChars: false,
      useWords: false,
      separator: '.',
    }
    initializeDefaultSuffixes()
  }

  return {
    // 状态
    emailSuffixes,
    generationConfig,
    selectedSuffix,
    lastGeneratedEmail,
    isGenerating,
    
    // 计算属性
    enabledSuffixes,
    selectedSuffixObject,
    canGenerate,
    
    // 方法
    initializeStore,
    addCustomSuffix,
    removeSuffix,
    toggleSuffix,
    setSelectedSuffix,
    updateGenerationConfig,
    generateEmail,
    generateAndCopyEmail,
    copyToClipboard,
    resetToDefaults,
  }
})
