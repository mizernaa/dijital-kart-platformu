
<div align="center">

<img src="https://img.shields.io/badge/status-active-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" />

</div>

<br />

<h1 align="center">
  📱 Dijital Kartvizit Platformu
</h1>

<p align="center">
  <b>QR kod ve NFC ile anında paylaşılabilen, kurumsal dijital kimlik kartı SaaS platformu.</b><br/>
  <sub>Express API • Next.js Dashboard • Prisma • PostgreSQL • Redis</sub>
</p>

<br />

---

## ✨ Özellikler

<table>
<tr>
<td width="50%">

### 👤 Dijital Profil
- Kişiselleştirilebilir profil sayfası (`/u/kullaniciadi`)
- vCard (.vcf) indirme desteği
- Profil fotoğrafı yükleme
- Sosyal medya bağlantıları
- İletişim bilgileri yönetimi

</td>
<td width="50%">

### 📊 Analitik & Takip
- Profil görüntülenme istatistikleri
- Günlük/haftalık/aylık raporlar
- Lead (potansiyel müşteri) takibi
- Buton tıklanma analitiği
- KVKK uyumlu (IP hash'leme)

</td>
</tr>
<tr>
<td>

### 📱 QR & NFC
- Özelleştirilebilir QR kod (PNG/SVG)
- NFC sipariş yönetimi
- QR şablon stilleri
- Toplu QR indirme

</td>
<td>

### 🛡️ Kurumsal
- Rol tabanlı yetkilendirme (Admin/Support/Müşteri)
- JWT access + refresh token auth
- Çoklu paket/sınırsız profil desteği
- Merkezi admin paneli

</td>
</tr>
</table>

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────┐
│                    Nginx / Traefik                   │
│                   (Reverse Proxy)                    │
└──────┬────────────────┬────────────────┬────────────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    API       │ │  Dashboard   │ │ Public Site  │
│  Express.js  │ │  Next.js 14  │ │  Next.js 14  │
│  Port 3001   │ │  Port 3000   │ │  Port 3002   │
└──────┬───────┘ └──────────────┘ └──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │
│  (Prisma)    │    │   (Cache)    │
└──────────────┘    └──────────────┘
```

<details>
<summary>📁 Detaylı dizin yapısı</summary>

```
dijital-kart-platformu/
├── apps/
│   ├── api/                    # Express REST API
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── admin/      # Admin panel endpoint'leri
│   │       │   ├── customer/   # Müşteri dashboard endpoint'leri
│   │       │   └── public/     # Herkese açık endpoint'ler
│   │       ├── middleware/     # Auth & error handler
│   │       ├── utils/          # JWT, QR, vCard yardımcıları
│   │       └── jobs/           # Zamanlanmış görevler
│   ├── web/                    # Admin + Müşteri Dashboard (Next.js)
│   │   └── app/
│   │       ├── admin/          # Admin panel sayfaları
│   │       ├── dashboard/      # Müşteri paneli sayfaları
│   │       └── (auth)/         # Login sayfası
│   └── public-site/            # Herkese açık profil sayfaları
│       └── app/u/[slug]/       # Dinamik profil route'u
└── packages/
    ├── database/               # Prisma schema, migrations, seed
    └── types/                  # Paylaşılan TypeScript tipleri
```
</details>

---

## 🛠️ Teknoloji Yığını

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
</p>

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

```bash
Node.js >= 18    PostgreSQL    Redis
```

### 1. Kurulum

```bash
git clone https://github.com/mizernaa/dijital-kart-platformu.git
cd dijital-kart-platformu
npm install
```

### 2. Ortam Değişkenleri

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/public-site/.env.local.example apps/public-site/.env.local
```

> `.env` içinde `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` değerlerini ayarlayın.

### 3. Veritabanı

```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 4. Çalıştır

```bash
# Tek komutla tüm servisler (Turborepo)
npm run dev

# Ya da Windows'ta:
BASLAT.bat
```

| Servis | Adres |
|--------|-------|
| 🔌 API | http://localhost:3001 |
| 🖥️ Dashboard | http://localhost:3000 |
| 🌐 Public Site | http://localhost:3002 |

---

## 🔑 Test Hesapları

| Rol | Kullanıcı Adı | Şifre |
|-----|--------------|-------|
| 🔴 Super Admin | `superadmin` | `Admin1234!` |
| 🔵 Demo Müşteri | `ahmetdemir` | `Musteri123!` |

---

## 📡 API Referansı

### 🔐 Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/auth/login` | Giriş |
| POST | `/auth/refresh` | Token yenile |
| POST | `/auth/logout` | Çıkış |
| POST | `/auth/change-password` | Şifre değiştir |

### 👑 Admin (SUPER_ADMIN / SUPPORT)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST | `/admin/users` | Kullanıcı listesi / ekle |
| GET/PUT/DELETE | `/admin/users/:id` | Kullanıcı detay / güncelle / sil |
| PATCH | `/admin/users/:id/status` | Durum değiştir |
| GET/PUT | `/admin/packages/:id` | Paket detay / güncelle |

### 👤 Müşteri Dashboard
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/PUT | `/customer/profile` | Profil görüntüle / düzenle |
| GET/POST/PUT/DELETE | `/customer/profile/contacts` | İletişim bilgileri |
| GET/POST/PUT/DELETE | `/customer/profile/socials` | Sosyal medya |
| GET/POST | `/customer/qr` | QR kod yönetimi |
| GET | `/customer/qr/download?format=png\|svg` | QR indir |
| GET | `/customer/analytics?days=7\|30\|90` | Analitik verisi |

### 🌍 Public (Auth gerektirmez)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/p/:slug` | Profil verisi |
| POST | `/p/:slug/event` | Analitik event gönder |
| GET | `/p/:slug/vcard` | vCard dosyası indir |

---

## 📈 Proje Durumu

Faz 1 ve Faz 2 tamamlandı. Faz 3 (şirket CV'si) geliştirme aşamasında.

Detaylı ilerleme için: [`ILERLEME.md`](ILERLEME.md)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/mizernaa">mizernaa</a></sub>
</div>
