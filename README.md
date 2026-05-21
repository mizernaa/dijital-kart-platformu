# Dijital Kart Platformu

QR kod ve NFC teknolojisiyle paylaşılabilen dijital kimlik kartı SaaS platformu.

## Mimari

```
apps/
  api/          → Node.js + Express + TypeScript (port 3001)
  web/          → Next.js 14 — Admin + Müşteri Dashboard (port 3000)
  public-site/  → Next.js 14 — Public Profil Sayfaları (port 3002)
packages/
  database/     → Prisma schema + client
  types/        → Paylaşılan TypeScript tipleri
```

## Kurulum

### Gereksinimler
- Node.js >= 18
- PostgreSQL
- Redis

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. Ortam değişkenlerini ayarla
```bash
# Root .env (API için)
cp .env.example .env

# Web dashboard
cp apps/web/.env.local.example apps/web/.env.local

# Public site
cp apps/public-site/.env.local.example apps/public-site/.env.local
```

`.env` dosyasında `DATABASE_URL` ve `JWT_*` değerlerini ayarlayın.

### 3. Veritabanını hazırla
```bash
cd packages/database
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 4. Çalıştır
```bash
# Root dizininden tüm servisleri başlat
npm run dev

# Veya ayrı ayrı:
cd apps/api && npm run dev        # API: http://localhost:3001
cd apps/web && npm run dev        # Dashboard: http://localhost:3000
cd apps/public-site && npm run dev # Public: http://localhost:3002
```

## Test Hesapları (Seed sonrası)

| Rol | Kullanıcı Adı | Şifre |
|-----|--------------|-------|
| Super Admin | superadmin | Admin1234! |
| Demo Müşteri | ahmetdemir | Musteri123! |

## API Endpoint'leri

### Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`

### Admin (SUPER_ADMIN / SUPPORT)
- `GET/POST /admin/users`
- `GET/PUT/DELETE /admin/users/:id`
- `PATCH /admin/users/:id/status`
- `POST /admin/users/:id/reset-password`
- `GET/PUT /admin/packages/:id`

### Müşteri Dashboard
- `GET/PUT /customer/profile`
- `POST /customer/profile/avatar`
- `GET/POST/PUT/DELETE /customer/profile/contacts`
- `GET/POST/PUT/DELETE /customer/profile/socials`
- `GET/POST /customer/qr`
- `GET /customer/qr/download?format=png|svg`
- `GET /customer/analytics?days=7|30|90`

### Public (auth gerektirmez)
- `GET /p/:slug` — Profil verisi
- `POST /p/:slug/event` — Analitik event
- `GET /p/:slug/vcard` — vCard (.vcf) indir

## Public Profil URL
```
http://localhost:3002/u/ahmetdemir
```
