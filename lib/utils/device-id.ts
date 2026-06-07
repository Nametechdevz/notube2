import AsyncStorage from '@react-native-async-storage/async-storage'
import * as crypto from 'expo-crypto'
import Constants from 'expo-constants'

const DEVICE_ID_KEY = 'noutube_device_id'

let cachedDeviceId: string | null = null

export const getOrCreateDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) {
    return cachedDeviceId
  }

  try {
    // Intentar obtener del almacenamiento local
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY)
    if (stored) {
      cachedDeviceId = stored
      return stored
    }

    // Generar nuevo ID único
    const randomBytes = await crypto.getRandomBytesAsync(16)
    const hex = randomBytes.toString('hex')

    // Crear ID con timestamp y app unique identifier
    const appId = Constants.expoConfig?.slug || 'noutube'
    const timestamp = Date.now().toString(36)
    const deviceId = `${appId}-${timestamp}-${hex.substring(0, 12)}`

    // Guardar para futuras usos
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId)
    cachedDeviceId = deviceId

    return deviceId
  } catch (error) {
    // Fallback: generar ID temporal si falla
    const fallbackId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    return fallbackId
  }
}

export const clearDeviceId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY)
    cachedDeviceId = null
  } catch (error) {
    console.error('Error clearing device ID:', error)
  }
}
