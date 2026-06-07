import { useEffect, useCallback } from 'react'
import { useObserveEffect } from '@legendapp/state/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth$ } from '@/states/auth'
import { getOrCreateDeviceId } from '@/lib/utils/device-id'
import { validateCode } from '@/lib/panel/code-validation'

const CODE_STORAGE_KEY = 'noutube_panel_code'
const CODE_VALIDATION_INTERVAL = 30000 // Validar cada 30 segundos

export const useCodeAuth = () => {
  const validateStoredCode = useCallback(async () => {
    try {
      const deviceId = await getOrCreateDeviceId()
      auth$.deviceId.set(deviceId)

      const savedCode = await AsyncStorage.getItem(CODE_STORAGE_KEY)

      if (!savedCode) {
        auth$.codeValid.set(false)
        auth$.loaded.set(true)
        return
      }

      const response = await validateCode(savedCode, deviceId)

      if (response.ok) {
        auth$.panelCode.set(savedCode)
        auth$.codeExpiresAt.set(response.expires_at)
        auth$.codeSecondsLeft.set(response.seconds_left)
        auth$.codeValid.set(true)
      } else {
        // Código inválido, expirado o bloqueado
        await AsyncStorage.removeItem(CODE_STORAGE_KEY)
        auth$.panelCode.set(undefined)
        auth$.codeValid.set(false)
      }

      auth$.loaded.set(true)
    } catch (error) {
      console.error('Error validating code:', error)
      auth$.loaded.set(true)
    }
  }, [])

  // Cargar código guardado al iniciar
  useEffect(() => {
    validateStoredCode()
  }, [validateStoredCode])

  // Validar periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth$.panelCode.get()) {
        validateStoredCode()
      }
    }, CODE_VALIDATION_INTERVAL)

    return () => clearInterval(interval)
  }, [validateStoredCode])

  // Actualizar segundos restantes en tiempo real
  useEffect(() => {
    if (!auth$.codeSecondsLeft.get() || auth$.codeSecondsLeft.get()! <= 0) {
      return
    }

    const interval = setInterval(() => {
      const current = auth$.codeSecondsLeft.get()
      if (current && current > 0) {
        auth$.codeSecondsLeft.set(current - 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const setCode = useCallback(async (code: string) => {
    try {
      const deviceId = await getOrCreateDeviceId()
      const response = await validateCode(code, deviceId)

      if (response.ok) {
        await AsyncStorage.setItem(CODE_STORAGE_KEY, code.toUpperCase())
        auth$.panelCode.set(code.toUpperCase())
        auth$.codeExpiresAt.set(response.expires_at)
        auth$.codeSecondsLeft.set(response.seconds_left)
        auth$.codeValid.set(true)
        return { success: true }
      } else {
        return {
          success: false,
          reason: response.reason,
        }
      }
    } catch (error) {
      return {
        success: false,
        reason: 'request_failed',
      }
    }
  }, [])

  const clearCode = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CODE_STORAGE_KEY)
      auth$.panelCode.set(undefined)
      auth$.codeValid.set(false)
    } catch (error) {
      console.error('Error clearing code:', error)
    }
  }, [])

  return {
    isAuthenticated: auth$.codeValid,
    code: auth$.panelCode,
    expiresAt: auth$.codeExpiresAt,
    secondsLeft: auth$.codeSecondsLeft,
    loaded: auth$.loaded,
    setCode,
    clearCode,
    validateStoredCode,
  }
}
