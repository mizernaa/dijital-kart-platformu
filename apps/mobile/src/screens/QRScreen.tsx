import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { api, apiErrorMessage } from '../api/client'
import { colors, spacing } from '../theme'

type QRData = {
  profileUrl: string
  dataUrl: string // base64 PNG data URL
}

export default function QRScreen() {
  const [qr, setQr] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/customer/qr')
      setQr({ profileUrl: data.data.profileUrl, dataUrl: data.data.dataUrl })
    } catch (err) {
      Alert.alert('Hata', apiErrorMessage(err, 'QR kod yüklenemedi.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onShareLink() {
    if (!qr) return
    try {
      await Share.share({ message: `Dijital kartım: ${qr.profileUrl}`, url: qr.profileUrl })
    } catch {
      // kullanıcı paylaşımı iptal etti
    }
  }

  async function onCopy() {
    if (!qr) return
    await Clipboard.setStringAsync(qr.profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, alignItems: 'center' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load() }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.heading}>QR Kodun</Text>
      <Text style={styles.sub}>Bu kodu okutan herkes dijital kartına ulaşır.</Text>

      {qr && (
        <>
          <View style={styles.qrWrap}>
            <Image source={{ uri: qr.dataUrl }} style={styles.qrImage} />
          </View>

          <TouchableOpacity style={styles.urlBox} onPress={onCopy} activeOpacity={0.7}>
            <Text style={styles.urlText} numberOfLines={1}>{qr.profileUrl}</Text>
            <Text style={styles.copyHint}>{copied ? 'Kopyalandı ✓' : 'Kopyalamak için dokun'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={onShareLink}>
            <Text style={styles.shareBtnText}>Linki Paylaş</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            QR'ı yazdırılabilir yüksek çözünürlükte (PNG/SVG) indirmek için web panelindeki QR
            sayfasını kullanabilirsin.
          </Text>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: spacing.lg, textAlign: 'center' },
  qrWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: spacing.md,
    // QR beyaz zeminde en güvenli şekilde okunur
  },
  qrImage: { width: 240, height: 240 },
  urlBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  urlText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  copyHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.lg },
})
