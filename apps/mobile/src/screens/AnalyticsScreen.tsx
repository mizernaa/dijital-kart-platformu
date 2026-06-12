import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { api } from '../api/client'
import { colors, spacing } from '../theme'

type Analytics = {
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  leadCount: number
  dailyViews: { date: string; count: number }[]
  sourceCounts: Record<string, number>
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; other: number }
  topButtons: { label: string; count: number }[]
}

const RANGES = [7, 30, 90] as const

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Doğrudan',
  qr: 'QR kod',
  nfc: 'NFC',
  link: 'Link',
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Telefon',
  desktop: 'Bilgisayar',
  tablet: 'Tablet',
  other: 'Diğer',
}

export default function AnalyticsScreen() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (range: number) => {
    try {
      const res = await api.get(`/customer/analytics?days=${range}`)
      setData(res.data.data)
    } catch {
      // 401'de AuthContext çıkışı halleder
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load(days)
  }, [days, load])

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  const maxDaily = Math.max(1, ...(data?.dailyViews.map(d => d.count) ?? [1]))
  const deviceTotal = data
    ? Object.values(data.deviceBreakdown).reduce((a, b) => a + b, 0)
    : 0
  const sourceTotal = data
    ? Object.values(data.sourceCounts).reduce((a, b) => a + b, 0)
    : 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(days) }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.heading}>İstatistikler</Text>

      {/* Aralık seçici */}
      <View style={styles.rangeRow}>
        {RANGES.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, days === r && styles.rangeBtnActive]}
            onPress={() => setDays(r)}
          >
            <Text style={[styles.rangeText, days === r && styles.rangeTextActive]}>
              {r} gün
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Özet kartları */}
      <View style={styles.statsGrid}>
        <Summary label="Görüntülenme" value={data?.totalViews ?? 0} />
        <Summary label="Tekil ziyaretçi" value={data?.uniqueVisitors ?? 0} />
        <Summary label="Kart indirme" value={data?.vcardDownloads ?? 0} />
        <Summary label="Lead" value={data?.leadCount ?? 0} />
      </View>

      {/* Günlük görüntülenme grafiği */}
      <Section title="Günlük görüntülenme">
        {data && data.dailyViews.length > 0 ? (
          <View style={styles.chart}>
            {data.dailyViews.map(d => (
              <View key={d.date} style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(3, (d.count / maxDaily) * 120) },
                  ]}
                />
              </View>
            ))}
          </View>
        ) : (
          <Empty />
        )}
        {data && data.dailyViews.length > 0 && (
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>{formatDate(data.dailyViews[0].date)}</Text>
            <Text style={styles.chartLabel}>
              {formatDate(data.dailyViews[data.dailyViews.length - 1].date)}
            </Text>
          </View>
        )}
      </Section>

      {/* Kaynak dağılımı */}
      <Section title="Ziyaret kaynağı">
        {sourceTotal > 0 && data ? (
          Object.entries(data.sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => (
              <BarRow
                key={source}
                label={SOURCE_LABELS[source] || source}
                count={count}
                total={sourceTotal}
              />
            ))
        ) : (
          <Empty />
        )}
      </Section>

      {/* Cihaz dağılımı */}
      <Section title="Cihazlar">
        {deviceTotal > 0 && data ? (
          Object.entries(data.deviceBreakdown)
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([device, count]) => (
              <BarRow
                key={device}
                label={DEVICE_LABELS[device] || device}
                count={count}
                total={deviceTotal}
              />
            ))
        ) : (
          <Empty />
        )}
      </Section>

      {/* En çok tıklanan butonlar */}
      <Section title="En çok tıklananlar">
        {data && data.topButtons.length > 0 ? (
          data.topButtons.map(b => (
            <View key={b.label} style={styles.buttonRow}>
              <Text style={styles.buttonLabel} numberOfLines={1}>{b.label}</Text>
              <Text style={styles.buttonCount}>{b.count}</Text>
            </View>
          ))
        ) : (
          <Empty />
        )}
      </Section>
    </ScrollView>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

function BarRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = Math.round((count / total) * 100)
  return (
    <View style={styles.barRowWrap}>
      <View style={styles.barRowHeader}>
        <Text style={styles.barRowLabel}>{label}</Text>
        <Text style={styles.barRowValue}>{count} · %{pct}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(2, pct)}%` }]} />
      </View>
    </View>
  )
}

function Empty() {
  return <Text style={styles.empty}>Henüz veri yok.</Text>
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  rangeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  rangeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rangeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  rangeTextActive: { color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: 2,
  },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minWidth: 2,
  },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { color: colors.textMuted, fontSize: 11 },
  barRowWrap: { marginBottom: spacing.sm },
  barRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barRowLabel: { color: colors.text, fontSize: 14 },
  barRowValue: { color: colors.textMuted, fontSize: 13 },
  barTrack: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  buttonLabel: { color: colors.text, fontSize: 14, flex: 1, marginRight: spacing.sm },
  buttonCount: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: spacing.sm },
})
