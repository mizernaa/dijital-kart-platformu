# Dijital Kart Platformu — İlerleme Kaydı

Son güncelleme: 2026-05-18

---

## Faz 1 — MVP ✅ Tamamlandı

### Altyapı
- Turborepo monorepo kurulumu (`apps/api`, `apps/web`, `apps/public-site`, `packages/database`, `packages/types`)
- PostgreSQL 18.3 (Scoop), Redis 8.6.3 (Scoop), Node.js v24.15.0
- pm2 ile 3 servis yönetimi (`dkp-api`, `dkp-web`, `dkp-public`)
- `BASLAT.bat` — tek tıkla tüm servisleri başlatır

### Veritabanı (Prisma)
| Model | Açıklama |
|---|---|
| Package | FREE/STARTER/PRO/ENTERPRISE paketler |
| User | Admin + müşteri hesapları, JWT auth |
| RefreshToken | 7 günlük refresh token'lar (PostgreSQL'de) |
| Profile | Slug, tema, biyografi, avatar |
| ContactItem | Telefon, e-posta, WhatsApp, Telegram, website |
| SocialLink | Instagram, LinkedIn, GitHub vb. |
| QRCode | Renk, logo, format (PNG/SVG) |
| AnalyticsEvent | PAGE_VIEW, BUTTON_CLICK, QR_SCAN, NFC_SCAN, VCARD_DOWNLOAD, CONTACT_FORM |

### API (`apps/api` — port 3001)
- `POST /auth/login` — JWT access (15dk) + refresh (7gün)
- `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/change-password`
- `/admin/users` — CRUD, durum değiştirme, şifre sıfırlama
- `/admin/packages` — Paket yönetimi
- `/customer/profile` — Profil getir/güncelle, avatar yükle
- `/customer/contacts` — CRUD
- `/customer/socials` — CRUD
- `/customer/qr` — QR kod oluştur/indir
- `/customer/analytics` — Analitik özeti
- `GET /p/:slug` — Public profil verisi
- `POST /p/:slug/event` — Analitik event kayıt (IP SHA-256 hash, KVKK uyumu)
- `GET /p/:slug/vcard` — vCard (.vcf) indirme

### Dashboard (`apps/web` — port 3000)
- Login sayfası, ilk giriş şifre değiştirme akışı
- Admin: Dashboard, Müşteriler (CRUD + temp şifre), Paketler
- Müşteri: Genel Bakış, Profilim, Tasarım, QR Kod, Analitik (LineChart + BarChart)
- Sidebar rol bazlı navigasyon

### Public Site (`apps/public-site` — port 3002)
- SSR profil sayfaları `/u/[slug]`
- Open Graph meta tagları (SEO)
- İletişim butonları, sosyal medya grid, vCard indirme
- PAGE_VIEW ve BUTTON_CLICK event takibi

### Test Hesapları
- **Admin:** `superadmin / Admin1234!`
- **Demo Müşteri:** `ahmetdemir / Musteri123!` → `http://localhost:3002/u/ahmetdemir`

---

## Faz 2 ✅ Tamamlandı (2026-05-11)

### 1. Prisma Schema Güncellemesi
**Migration:** `20260510203304_faz2_lead_nfc`

Yeni modeller:
```prisma
model LeadCapture {
  id, profileId, name, email?, message, isRead (default: false), createdAt
}

model NfcOrder {
  id, userId, status (NfcOrderStatus), trackingNumber?, address, notes?, createdAt, updatedAt
}

enum NfcOrderStatus { PENDING, PRODUCTION, SHIPPED, DELIVERED, CANCELLED }
```

### 2. Lead Capture API

| Endpoint | Açıklama |
|---|---|
| `POST /p/:slug/lead` | Public form gönderimi, Resend ile e-posta bildirimi |
| `GET /customer/leads?page&limit&unreadOnly` | Sayfalı liste + unreadCount |
| `GET /customer/leads/export` | CSV indirme (BOM dahil, Excel uyumlu) |
| `PATCH /customer/leads/:id/read` | Tek lead okundu |
| `PATCH /customer/leads/read-all` | Tümünü okundu |

### 3. NFC Sipariş API

| Endpoint | Açıklama |
|---|---|
| `GET /customer/nfc` | Müşterinin son siparişi |
| `GET /customer/nfc/history` | Tüm sipariş geçmişi |
| `GET /admin/nfc-orders?status&page` | Tüm siparişler (filtreli) |
| `POST /admin/nfc-orders` | Yeni sipariş oluştur |
| `PUT /admin/nfc-orders/:id` | Durum / kargo no güncelle |

### 4. Gelişmiş Analitik

`GET /customer/analytics` yanıtına eklenenler:
- `deviceBreakdown` — desktop / mobile / tablet / other
- `browserBreakdown` — tarayıcı adı → sayı
- `hourlyDistribution` — 0-23 saat, her saatte ziyaret sayısı
- `leadCount` — toplam form mesajı sayısı

`GET /customer/analytics/export` — olayları CSV olarak indir

### 5. Haftalık E-posta Cron

- `apps/api/src/jobs/weeklyReport.ts`
- Her Pazartesi 09:00 çalışır (`node-cron`)
- `RESEND_API_KEY` placeholder ise sessizce atlar
- İçerik: toplam görüntülenme, benzersiz ziyaretçi, okunmamış mesaj, en çok tıklanan buton

### 6. Dashboard — Mesajlar Sayfası

`/dashboard/leads`
- Lead tablosu (okunmadı badge, okundu işaret)
- "Tümünü Okundu İşaretle" butonu
- "CSV İndir" butonu
- Lead detay modal (tam mesaj + yanıtla linki)
- Sayfalama

### 7. Dashboard — NFC Sayfası (Müşteri)

`/dashboard/nfc`
- Adım göstergesi: Bekliyor → Üretimde → Kargoda → Teslim Edildi
- Kargo takip numarası gösterimi
- İptal durumu ayrı ekran
- Geçmiş siparişler accordion

### 8. Dashboard — NFC Siparişler (Admin)

`/admin/nfc-orders`
- Tüm siparişler tablosu (müşteri, durum badge, kargo no, tarih)
- Durum filtresi
- Durum/kargo güncelleme modal
- Yeni sipariş oluşturma modal

### 9. Dashboard — Sidebar Güncellemeleri

- Müşteri: "Mesajlar" nav item (okunmamış sayısı kırmızı badge)
- Müşteri: "NFC Sipariş" nav item
- Admin: "NFC Siparişler" nav item

### 10. Dashboard — Analitik Sayfası Genişletmesi

`/dashboard/analytics`
- Cihaz dağılımı: PieChart (Recharts)
- Tarayıcı dağılımı: yatay BarChart
- Saatlik yoğunluk: 24 sütunlu BarChart
- Toplam Mesaj sayısı kartı
- "CSV" butonu — analytics export

### 11. Public Site — "Bana Ulaş" Formu

`ProfileView.tsx` altına eklendi:
- Ad Soyad (zorunlu), E-posta (opsiyonel), Mesaj (zorunlu, max 500)
- `POST /p/:slug/lead` çağrısı
- Başarı → teşekkür ekranı + "Tekrar gönder" linki
- Hata → hata mesajı
- Tema renklerine (koyu/açık) uyumlu stil

---

## Sıradaki — Faz 3 (Planlanmadı)

| Özellik | Durum |
|---|---|
| PDF rapor (pdfkit) | Planlandı |
| Özel domain desteği | Planlandı |
| Takım üyeleri | Planlandı |
| Ödeme entegrasyonu | Planlandı |
| Paket limiti enforcement | Kısmi (Faz 1'de yazılmadı) |

---

## Servis Durumu

```
pm2 list → dkp-api (port 3001), dkp-web (port 3000), dkp-public (port 3002)

Dashboard  : http://localhost:3000
API        : http://localhost:3001
Public     : http://localhost:3002/u/ahmetdemir
```

## Bug Fix — Analytics Raw SQL (2026-05-18)

Prisma camelCase sütun adları raw SQL'de tırnak gerektiriyor:

```sql
-- YANLIŞ (hata: column "created_at" does not exist)
WHERE profile_id = $1 AND event_type = 'PAGE_VIEW' AND created_at >= $2

-- DOĞRU
WHERE "profileId" = $1 AND "eventType" = 'PAGE_VIEW'::"EventType" AND "createdAt" >= $2
```

Dosya: `apps/api/src/routes/customer/analytics.ts` — iki `$queryRaw` bloğunda düzeltildi.

---

## Test Sonuçları — Faz 2 (2026-05-18)

| Endpoint | Sonuç |
|---|---|
| `POST /p/ahmetdemir/lead` | ✅ Lead oluşturuldu |
| `GET /customer/leads` | ✅ total:1, unreadCount:1 |
| `PATCH /customer/leads/read-all` | ✅ updated:1, sonra unreadCount:0 |
| `GET /customer/analytics` | ✅ leadCount, hourlyDistribution (24h), deviceBreakdown |
| `POST /admin/nfc-orders` | ✅ PENDING sipariş oluşturuldu |
| `GET /customer/nfc` | ✅ Sipariş görünüyor |
| `PUT /admin/nfc-orders/:id` | ✅ Status SHIPPED, trackingNumber TR123456789 |

---

## Önemli Notlar

- **Prisma generate** öncesi `pm2 stop dkp-api` çalıştır (Windows DLL lock hatası)
- **RESEND_API_KEY** şu an `re_placeholder` — gerçek anahtar girilmeden e-posta gönderilmez
- **Redis** şu an kod tarafında aktif kullanılmıyor (token'lar PostgreSQL'de)
- Analytics IP'ler SHA-256 ile hash'leniyor (KVKK uyumu)
