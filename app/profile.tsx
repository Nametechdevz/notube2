import { View, Text, TouchableOpacity, useColorScheme, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useCodeAuth } from '@/lib/hooks/useCodeAuth'
import { formatSecondsLeft, formatExpiryDate } from '@/lib/panel/code-validation'

export default function ProfileScreen() {
  const router = useRouter()
  const { code, expiresAt, secondsLeft, clearCode } = useCodeAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await clearCode()
          router.replace('/login')
        },
      },
    ])
  }

  const codeValue = code.get()
  const expiryValue = expiresAt.get()
  const secondsValue = secondsLeft.get()

  const getSecondsColor = () => {
    if (!secondsValue || secondsValue < 0) return 'text-red-500'
    if (secondsValue < 86400) return 'text-orange-500' // < 1 día
    if (secondsValue < 604800) return 'text-yellow-500' // < 7 días
    return 'text-green-500'
  }

  return (
    <ScrollView
      className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Mi Perfil
          </Text>
          <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Información de tu cuenta
          </Text>
        </View>

        {/* Información del Código */}
        <View className={`${isDark ? 'bg-zinc-800' : 'bg-zinc-50'} rounded-xl p-6 mb-6 border ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Estado de la Suscripción
          </Text>

          {/* Código */}
          <View className="mb-5">
            <Text className={`text-xs font-semibold uppercase mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Código
            </Text>
            <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-lg p-3 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
              <Text className="text-xl font-mono font-bold text-blue-500">
                {codeValue || '---'}
              </Text>
            </View>
          </View>

          {/* Vencimiento */}
          <View className="mb-5">
            <Text className={`text-xs font-semibold uppercase mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Vencimiento
            </Text>
            <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-lg p-3 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
              <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {expiryValue ? formatExpiryDate(expiryValue) : '---'}
              </Text>
            </View>
          </View>

          {/* Tiempo Restante */}
          <View>
            <Text className={`text-xs font-semibold uppercase mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Tiempo Restante
            </Text>
            <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-lg p-3 border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
              <Text className={`text-lg font-bold ${getSecondsColor()}`}>
                {secondsValue !== undefined ? formatSecondsLeft(secondsValue) : '---'}
              </Text>
              {secondsValue && secondsValue < 86400 && (
                <Text className="text-xs text-red-500 mt-1">
                  ⚠️ Tu suscripción vence próximamente
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Botón de Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-lg py-3 items-center"
        >
          <Text className="text-white text-lg font-bold">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View
          className={`mt-6 ${isDark ? 'bg-zinc-800/50' : 'bg-blue-50'} rounded-lg p-4 border ${isDark ? 'border-zinc-700' : 'border-blue-200'}`}
        >
          <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-blue-800'}`}>
            <Text className="font-semibold">ℹ️ Nota: </Text>
            Tu suscripción se valida automáticamente. Si el código expira o es bloqueado, tendrás que ingresar uno nuevo.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
