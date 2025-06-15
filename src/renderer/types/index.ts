// Common type definitions for the renderer process

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface AppSettings {
  theme: ThemeMode
  fontSize: number
}

export interface SystemInfo {
  platform: string
  version: string
  electronVersion: string
  nodeVersion: string
  chromeVersion: string
}

export interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export interface FormData {
  name: string
  email: string
  message: string
}

export interface FormErrors {
  name: string
  email: string
  message: string
}

export interface Theme {
  value: string
  label: string
  color: string
}

export interface NavigationRoute {
  path: string
  name: string
  meta?: {
    title?: string
    requiresAuth?: boolean
    icon?: string
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Settings validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// File operation result
export interface FileOperationResult {
  success: boolean
  error?: string
  filePath?: string
}
