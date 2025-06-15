/**
 * Unified error handling utilities
 */

export interface ErrorHandlerOptions {
  showUserNotification?: boolean
  logToConsole?: boolean
  title?: string
  type?: 'error' | 'warning' | 'info'
}

/**
 * Handle errors consistently across the application
 */
export async function handleError(
  error: unknown,
  message: string,
  options: ErrorHandlerOptions = {},
): Promise<void> {
  const {
    showUserNotification = true,
    logToConsole = true,
    title = 'Error',
    type = 'error',
  } = options

  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const fullMessage = `${message}: ${errorMessage}`

  // Log to console
  if (logToConsole) {
    console.error(fullMessage, error)
  }

  // Show user notification if available
  if (showUserNotification && window.electronAPI) {
    try {
      await window.electronAPI.showMessageBox({
        type,
        title,
        message: fullMessage,
      })
    }
    catch (notificationError) {
      console.error('Failed to show error notification:', notificationError)
    }
  }
}

/**
 * Handle success messages consistently
 */
export async function handleSuccess(message: string, title: string = 'Success'): Promise<void> {
  if (window.electronAPI) {
    try {
      await window.electronAPI.showMessageBox({
        type: 'info',
        title,
        message,
      })
    }
    catch (error) {
      console.error('Failed to show success notification:', error)
    }
  }
}

/**
 * Wrapper for async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  options?: ErrorHandlerOptions,
): Promise<T | null> {
  try {
    return await operation()
  }
  catch (error) {
    await handleError(error, errorMessage, options)
    return null
  }
}
