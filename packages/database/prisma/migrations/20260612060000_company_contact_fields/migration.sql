-- Şirket bölümüne iletişim alanları: telefon, adres, sosyal medya linkleri (JSON)
ALTER TABLE "Profile" ADD COLUMN "companyPhone" TEXT;
ALTER TABLE "Profile" ADD COLUMN "companyAddress" TEXT;
ALTER TABLE "Profile" ADD COLUMN "companySocials" TEXT;
