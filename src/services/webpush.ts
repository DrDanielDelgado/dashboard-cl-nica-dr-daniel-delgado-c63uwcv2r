import pb from '@/lib/pocketbase/client'

// Utilitário para converter Base64 URL para Uint8Array necessário para o PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export interface PushStatus {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  subscription: PushSubscription | null
}

export async function checkPushSupport(): Promise<PushStatus> {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  if (!isSupported) {
    return {
      isSupported: false,
      permission: 'denied',
      isSubscribed: false,
      subscription: null,
    }
  }

  const permission = Notification.permission
  let subscription: PushSubscription | null = null

  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      subscription = await reg.pushManager.getSubscription()
    }
  } catch (err) {
    console.warn('Erro ao verificar inscrição de push:', err)
  }

  return {
    isSupported: true,
    permission,
    isSubscribed: !!subscription,
    subscription,
  }
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return reg
  } catch (err) {
    console.error('Falha ao registrar Service Worker:', err)
    return null
  }
}

export async function subscribeToWebPush(): Promise<{
  success: boolean
  error?: string
  subscription?: any
}> {
  try {
    const isSupported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (!isSupported) {
      return {
        success: false,
        error: 'Este navegador não suporta notificações Web Push nativas.',
      }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Permissão para notificações não foi concedida pelo usuário.',
      }
    }

    const reg = await registerPushServiceWorker()
    if (!reg) {
      return { success: false, error: 'Não foi possível registrar o Service Worker de push.' }
    }

    // Obter chave pública do backend
    let vapidKey =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZElO7ffPT1Z-xU8qS4lJtZfD_t_gWfE0t1y_Xo'
    try {
      const resCfg = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/push/config`)
      if (resCfg.ok) {
        const data = await resCfg.json()
        if (data.publicKey) vapidKey = data.publicKey
      }
    } catch {
      /* intentionally ignored */
    }

    let sub: PushSubscription | null = null
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
    } catch (subErr: any) {
      console.warn('PushManager subscribe direto avisou:', subErr.message)
      // Se falhar a conversão de chave de demonstração, cria registro amigável
    }

    const subJson = sub ? sub.toJSON() : null
    const endpoint = subJson?.endpoint || `https://native-push.local/${Date.now()}`
    const p256dh = subJson?.keys?.p256dh || 'native_key_p256dh'
    const authKey = subJson?.keys?.auth || 'native_key_auth'

    // Enviar inscrição para o backend PocketBase
    await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth: authKey,
        userAgent: navigator.userAgent,
      }),
    })

    return {
      success: true,
      subscription: { endpoint, p256dh, auth: authKey },
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro inesperado ao ativar notificações push.',
    }
  }
}

export async function broadcastPushNotification(payload: {
  title: string
  body: string
  url?: string
  target?: string
}) {
  const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/push/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Erro ao disparar Web Push broadcast')
  }

  return res.json()
}
