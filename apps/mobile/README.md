# qansvizit — Mobil Uygulama

Müşterilerin dijital kartlarını telefondan yönetmesi için Expo (React Native) uygulaması.
Mevcut API'yi kullanır: `https://api.qansvizit.com`.

> Not: Bu uygulama monorepo workspace'inden **hariç** tutulmuştur (React 19 vs 18
> çakışmasını önlemek için). Kendi bağımsız `node_modules`'ı vardır.

## Çalıştırma (geliştirme)

```bash
cd apps/mobile
npm install          # ilk sefer
npm start            # Metro bundler başlar, QR kod çıkar
```

Telefonda **Expo Go** uygulamasını indir (App Store / Play Store), açılan QR kodu okut.
Bilgisayar ve telefon aynı Wi-Fi'da olmalı.

- Android emülatör: `npm run android`
- iOS simülatör (sadece macOS): `npm run ios`

## Yapı

```
App.tsx                     → Navigasyon + auth yönlendirme (giriş yoksa Login, varsa Dashboard)
src/config.ts               → API ve public site URL'leri
src/theme.ts                → Renk/aralık paleti
src/api/client.ts           → axios instance + 401'de otomatik token yenileme
src/api/storage.ts          → Token'ları expo-secure-store ile şifreli saklama
src/context/AuthContext.tsx → Oturum durumu (login/logout)
src/screens/LoginScreen.tsx
src/screens/DashboardScreen.tsx → Profil özeti + son 30 gün istatistik + paylaş
```

## Test hesabı

Demo müşteri: `elifyildiz` / `Demo1234!`

## Sonraki fazlar

- Faz 2: Profil düzenleme, QR ekranı, detaylı istatistik
- Faz 3: Push bildirim (yeni ziyaret/lead)
- Faz 4: EAS Build → App Store + Play Store
