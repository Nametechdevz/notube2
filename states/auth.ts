import { UserMetadata } from '@supabase/supabase-js'
import { observable } from '@legendapp/state'

interface Store {
  loaded: boolean
  userId: string | undefined
  user: UserMetadata | undefined
  accessToken: string
  plan: string | undefined
  // Panel authentication
  panelCode: string | undefined
  deviceId: string | undefined
  codeExpiresAt: string | undefined
  codeSecondsLeft: number | undefined
  codeValid: boolean
}

export const auth$ = observable<Store>({
  loaded: false,
  userId: undefined,
  user: undefined,
  accessToken: '',
  plan: undefined,
  panelCode: undefined,
  deviceId: undefined,
  codeExpiresAt: undefined,
  codeSecondsLeft: undefined,
  codeValid: false,
})
