import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { colors, spacing } from '../theme'
import { API_BASE_URL, PUBLIC_SITE_URL } from '../config'

type Profile = {
  displayName: string | null
  title: string | null
  avatarUrl: string | null
  slug: string
  isPublished: boolean
}

type Stats = {
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  leadCount: number
}

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/customer/profile'),
        api.get('/customer/analytics?days=30'),
      ])
      setProfile(pRes.data.data)
      setStats(sRes.data.data)
    } catch (err) {
      // 401 ise AuthContext zaten çıkış yapacak
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function onRefresh() {
    setRefreshing(true)
    load()
  }

  const publicUrl = profile ? `${PUBLIC_SITE_URL}/u/${profile.slug}` : ''

  async function onShare() {
    if (!publicUrl) return
    try {
      await Share.share({ message: `Dijital kartım: ${publicUrl}`, url: publicUrl })
    } catch {
      Alert.alert('Paylaşım yapılamadı.')
    }
  }

  function confirmLogout() {
    Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
    ])
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  const avatarSrc = profile?.avatarUrl
    ? { uri: profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${API_BASE_URL}${profile.avatarUrl}` }
    : null

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.hello}>Merhaba, {user?.username} 👋</Text>
        <TouchableOpacity onPress={confirmLogout}>
          <Text style={styles.logout}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Profil kartı */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          {avatarSrc ? (
            <Image source={avatarSrc} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(profile?.displayName || user?.username || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.displayName || 'İsimsiz'}</Text>
            {!!profile?.title && <Text style={styles.title}>{profile.title}</Text>}
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: profile?.isPublished ? colors.success : colors.textMuted }]} />
              <Text style={styles.statusText}>{profile?.isPublished ? 'Yayında' : 'Taslak'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
          <Text style={styles.shareBtnText}>Profili Paylaş</Text>
        </TouchableOpacity>
      </View>

      {/* İstatistikler */}
      <Text style={styles.sectionTitle}>Son 30 gün</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Görüntülenme" value={stats?.totalViews ?? 0} />
        <StatCard label="Tekil ziyaretçi" value={stats?.uniqueVisitors ?? 0} />
        <StatCard label="Kart indirme" value={stats?.vcardDownloads ?? 0} />
        <StatCard label="Toplam lead" value={stats?.leadCount ?? 0} />
      </View>

      <Text style={styles.urlHint}>{publicUrl}</Text>
    </ScrollView>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  hello: { fontSize: 20, fontWeight: '700', color: colors.text },
  logout: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.inputBg },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: colors.text, fontSize: 26, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  title: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, color: colors.textMuted },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  urlHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.lg },
})
