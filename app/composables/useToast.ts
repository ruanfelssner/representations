import type { ToastItem } from '~~/shared/schemas/ui/toast'

const defaultTimeout = 4000

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useToast = () => {
  const toasts = useState<ToastItem[]>('admin:toasts', () => [])

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const push = (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
    const id = toast.id || generateId()
    const payload: ToastItem = {
      id,
      message: toast.message,
      type: toast.type,
      timeout: toast.timeout,
    }
    toasts.value = [...toasts.value, payload]

    const timeout = toast.timeout ?? defaultTimeout
    if (timeout > 0) {
      setTimeout(() => remove(id), timeout)
    }
  }

  return {
    toasts,
    remove,
    success: (message: string, timeout?: number) => push({ type: 'success', message, timeout }),
    error: (message: string, timeout?: number) => push({ type: 'error', message, timeout }),
    info: (message: string, timeout?: number) => push({ type: 'info', message, timeout }),
    warning: (message: string, timeout?: number) => push({ type: 'warning', message, timeout }),
  }
}
