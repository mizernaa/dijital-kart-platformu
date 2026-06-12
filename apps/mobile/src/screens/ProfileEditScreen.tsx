import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { api, apiErrorMessage } from '../api/client'
import { colors, spacing } from '../theme'

type EditableProfile = {
  displayName: string
  title: string
  bio: string
  location: string
  tagline: string
  isPublished: boolean
}

const EMPTY: EditableProfile = {
  displayName: '',
  title: '',
  bio: '',
  location: '',
  tagline: '',
  isPublished: false,
}

export default function ProfileEditScreen() {
  const [form, setForm] = useState<EditableProfile>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/customer/profile')
      const p = data.data
      setForm({
        displayName: p.displayName || '',
        title: p.title || '',
        bio: p.bio || '',
        location: p.location || '',
        tagline: p.tagline || '',
        isPublished: !!p.isPublished,
      })
    } catch (err) {
      Alert.alert('Hata', apiErrorMessage(err, 'Profil yüklenemedi.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function set<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function onSave() {
    if (!form.displayName.trim()) {
      Alert.alert('Eksik bilgi', 'Görünen isim boş olamaz.')
      return
    }
    setSaving(true)
    try {
      await api.put('/customer/profile', {
        displayName: form.displayName.trim(),
        title: form.title.trim() || undefined,
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || null,
        tagline: form.tagline.trim() || null,
        isPublished: form.isPublished,
      })
      Alert.alert('Kaydedildi', 'Profilin güncellendi. ✓')
    } catch (err) {
      Alert.alert('Hata', apiErrorMessage(err, 'Kaydedilemedi.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.heading}>Profili Düzenle</Text>

        <Field label="Görünen İsim *">
          <TextInput
            style={styles.input}
            value={form.displayName}
            onChangeText={v => set('displayName', v)}
            placeholder="Adın Soyadın"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
          />
        </Field>

        <Field label="Ünvan">
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={v => set('title', v)}
            placeholder="Örn: Grafik Tasarımcı"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
          />
        </Field>

        <Field label="Slogan">
          <TextInput
            style={styles.input}
            value={form.tagline}
            onChangeText={v => set('tagline', v)}
            placeholder="Kısa ve akılda kalıcı bir cümle"
            placeholderTextColor={colors.textMuted}
            maxLength={160}
          />
        </Field>

        <Field label="Hakkında">
          <TextInput
            style={[styles.input, styles.multiline]}
            value={form.bio}
            onChangeText={v => set('bio', v)}
            placeholder="Kendinden kısaca bahset..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          <Text style={styles.counter}>{form.bio.length}/500</Text>
        </Field>

        <Field label="Konum">
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={v => set('location', v)}
            placeholder="Örn: İstanbul"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
          />
        </Field>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Profil yayında</Text>
            <Text style={styles.switchHint}>
              Kapatırsan public sayfan ziyaretçilere görünmez.
            </Text>
          </View>
          <Switch
            value={form.isPublished}
            onValueChange={v => set('isPublished', v)}
            trackColor={{ false: colors.cardBorder, true: colors.primaryDark }}
            thumbColor={form.isPublished ? colors.primary : colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Kaydet</Text>}
        </TouchableOpacity>

        <Text style={styles.note}>
          Fotoğraf, tema ve diğer gelişmiş ayarlar için web panelini kullanabilirsin.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  counter: { color: colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  switchLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  switchHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
})
