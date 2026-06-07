import '@/lib/i18n'
import './global.css'

import { StatusBar } from 'expo-status-bar'
import { settings$ } from '@/states/settings'
import { Appearance, View, useColorScheme } from 'react-native'
import NouTubeViewModule from '@/modules/nou-tube-view'
import { useObserveEffect } from '@legendapp/state/react'
import { Slot, useSegments, useRouter } from 'expo-router'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import { useCodeAuth } from '@/lib/hooks/useCodeAuth'
import { auth$ } from '@/states/auth'

function RootLayoutContent() {
  const segments = useSegments()
  const router = useRouter()
  const { isAuthenticated, loaded } = useCodeAuth()
  const isDarkTheme = useColorScheme() === 'dark'

  // Observar cambios en tema
  useObserveEffect(settings$.theme, ({ value }) => {
    const nextColorScheme = value === 'dark' || value === 'light' ? value : Appearance.getColorScheme() === 'light' ? 'light' : 'dark'
    Appearance.setColorScheme?.(nextColorScheme)
    ;(NouTubeViewModule as any).setTheme?.(value)
  })

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      ;(NouTubeViewModule as any).exit?.()
    }
  }, [])

  // Proteger rutas - redirigir a login si no está autenticado
  useEffect(() => {
    if (!loaded.get()) {
      return
    }

    const isLoginScreen = segments[0] === 'login'
    const isAuthentic = isAuthenticated.get()

    if (!isAuthentic && !isLoginScreen) {
      router.replace('/login')
    } else if (isAuthentic && isLoginScreen) {
      router.replace('/')
    }
  }, [segments, loaded.get(), isAuthenticated.get()])

  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme !== 'light'

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className={isDark ? 'bg-zinc-800' : 'bg-zinc-100'} style={{ height: insets.top, zIndex: 10 }} />
      <Slot />
      <View className={isDark ? 'bg-zinc-800' : 'bg-zinc-100'} style={{ height: insets.bottom }} />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  )
}
