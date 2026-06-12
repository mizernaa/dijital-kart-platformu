import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { api } from './client'

// Uygulama ön plandayken de bildirimi göster
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/**
 * Bildirim izni ister, Expo push token'ı alır ve sunucuya kaydeder.
 * Başarısızlık sessizce geçilir (ör. Expo Go'da Android push desteklenmez,
 * simülatörde token alınamaz) — uygulama akışını asla bloklamaz.
 */
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return // simülatör/emülatör

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Genel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const { status: existing } = await Notifications.getPermissionsAsync()
    let status = existing
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync()
      status = req.status
    }
    if (status !== 'granted') return

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
    const tokenRes = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    )

    await api.post('/customer/devices', {
      token: tokenRes.data,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    })
  } catch (err) {
    // Expo Go (SDK 53+) Android'de uzak push desteklemez — sessiz geç
    console.log('[Push] kayıt atlandı:', (err as Error)?.message)
  }
}
