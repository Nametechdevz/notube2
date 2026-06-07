const API_URL = 'https://youtube.otpcodes.com/panel_tizentube/panel2/api/check_code.php'

export interface CodeValidationResponse {
  ok: boolean
  app_enabled?: boolean
  reason?: string
  expires_at?: string
  seconds_left?: number
}

export const validateCode = async (
  code: string,
  deviceId: string
): Promise<CodeValidationResponse> => {
  try {
    const params = new URLSearchParams({
      code: code.toUpperCase().trim(),
      device_id: deviceId,
    })

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        ok: false,
        reason: 'network_error',
      }
    }

    const data = (await response.json()) as CodeValidationResponse
    return data
  } catch (error) {
    return {
      ok: false,
      reason: 'request_failed',
    }
  }
}

export const getErrorMessage = (reason?: string): string => {
  const messages: Record<string, string> = {
    not_found: 'Código no encontrado o inválido',
    expired: 'Tu código ha expirado',
    blocked: 'El código ha sido bloqueado',
    device_blocked: 'Este dispositivo fue expulsado',
    max_connections_reached: 'Se alcanzó el máximo de dispositivos',
    db_not_found: 'Error en el servidor',
    app_disabled: 'La aplicación está deshabilitada',
    missing_data: 'Datos incompletos',
    network_error: 'Error de conexión',
    request_failed: 'Error al validar el código',
    server_error: 'Error del servidor',
  }
  return messages[reason || 'request_failed'] || 'Error desconocido'
}

export const formatExpiryDate = (expiresAt?: string): string => {
  if (!expiresAt) return 'Desconocido'
  try {
    const date = new Date(expiresAt)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return expiresAt
  }
}

export const formatSecondsLeft = (seconds?: number): string => {
  if (!seconds || seconds < 0) return 'Expirado'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'Menos de 1 minuto'
}
