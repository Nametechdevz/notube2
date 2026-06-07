import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useCodeAuth } from '@/lib/hooks/useCodeAuth'
import { getErrorMessage, formatSecondsLeft } from '@/lib/panel/code-validation'

export default function LoginScreen() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setCode: setAuthCode } = useCodeAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const inputRef = useRef<TextInput>(null)

  // Auto-focus el input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleLogin = async () => {
    if (code.trim().length === 0) {
      setError('Por favor ingresa un código')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await setAuthCode(code)

      if (result.success) {
        // Redirigir a la app principal
        router.replace('/')
      } else {
        setError(getErrorMessage(result.reason))
        setCode('')
      }
    } catch (err) {
      setError('Error al validar el código')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (text: string) => {
    // Solo permitir caracteres válidos (letras y números)
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCode(cleaned)
    setError('')
  }

  return (
    <ScrollView
      className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center px-6 py-8">
        {/* Logo/Título */}
        <View className="mb-8 items-center">
          <Text className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            NouTube
          </Text>
          <Text className={`text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            YouTube Premium
          </Text>
        </View>

        {/* Card de entrada */}
        <View className={`${isDark ? 'bg-zinc-800' : 'bg-zinc-50'} rounded-xl p-6 mb-6`}>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Ingresa tu código
          </Text>

          {/* Input de código */}
          <View
            className={`border-2 rounded-lg px-4 py-3 mb-4 ${
              error
                ? 'border-red-500'
                : isDark
                  ? 'border-zinc-700 bg-zinc-900'
                  : 'border-zinc-300 bg-white'
            }`}
          >
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="XXXXXX"
              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
              maxLength={7}
              editable={!loading}
              className={`text-2xl font-mono font-bold tracking-widest ${isDark ? 'text-white' : 'text-black'}`}
              selectionColor={isDark ? '#3b82f6' : '#2563eb'}
              textAlign="center"
            />
          </View>

          {/* Mensaje de error */}
          {error && (
            <View className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
              <Text className="text-red-500 text-sm font-medium">
                <Text>⚠️ </Text>
                {error}
              </Text>
            </View>
          )}

          {/* Botón de login */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || code.trim().length === 0}
            className={`py-3 rounded-lg flex-row items-center justify-center ${
              loading || code.trim().length === 0
                ? isDark
                  ? 'bg-zinc-700'
                  : 'bg-zinc-300'
                : isDark
                  ? 'bg-blue-600'
                  : 'bg-blue-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="text-white text-lg font-bold">Acceder</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info/Help */}
        <View
          className={`${isDark ? 'bg-zinc-800/50' : 'bg-blue-50'} rounded-lg p-4 border ${isDark ? 'border-zinc-700' : 'border-blue-200'}`}
        >
          <Text className={`text-sm ${isDark ? 'text-zinc-300' : 'text-blue-900'}`}>
            <Text className="font-semibold">💡 Tip: </Text>
            Ingresa el código de 6 caracteres que compartió tu administrador. Incluye cualquier carácter adicional si lo hay.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
