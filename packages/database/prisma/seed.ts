import { PrismaClient, UserRole, UserStatus, PackageName } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Paketleri oluştur
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { name: PackageName.FREE },
      update: {},
      create: {
        name: PackageName.FREE,
        displayName: 'Ücretsiz',
        maxPages: 1,
        analyticsRetentionDays: 7,
        hasCustomDomain: false,
        hasNfc: false,
        maxThemes: 2,
        maxTeamMembers: 1,
      },
    }),
    prisma.package.upsert({
      where: { name: PackageName.STARTER },
      update: {},
      create: {
        name: PackageName.STARTER,
        displayName: 'Starter',
        maxPages: 3,
        analyticsRetentionDays: 30,
        hasCustomDomain: false,
        hasNfc: true,
        maxThemes: 5,
        maxTeamMembers: 1,
      },
    }),
    prisma.package.upsert({
      where: { name: PackageName.PRO },
      update: {},
      create: {
        name: PackageName.PRO,
        displayName: 'Pro',
        maxPages: 10,
        analyticsRetentionDays: 365,
        hasCustomDomain: true,
        hasNfc: true,
        maxThemes: 999,
        maxTeamMembers: 1,
      },
    }),
    prisma.package.upsert({
      where: { name: PackageName.ENTERPRISE },
      update: {},
      create: {
        name: PackageName.ENTERPRISE,
        displayName: 'Kurumsal',
        maxPages: 999,
        analyticsRetentionDays: 999,
        hasCustomDomain: true,
        hasNfc: true,
        maxThemes: 999,
        maxTeamMembers: 100,
      },
    }),
  ])

  console.log(`${packages.length} paket oluşturuldu.`)

  const freePackage = packages[0]
  const proPackage = packages[2]

  // Süper admin oluştur
  const adminHash = await bcrypt.hash('Admin1234!', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@dijitalkart.com',
      passwordHash: adminHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      passwordChanged: true,
      packageId: proPackage.id,
    },
  })
  console.log(`Admin oluşturuldu: ${admin.username}`)

  // Demo müşteri oluştur
  const customerHash = await bcrypt.hash('Musteri123!', 10)
  const customer = await prisma.user.upsert({
    where: { username: 'ahmetdemir' },
    update: {},
    create: {
      username: 'ahmetdemir',
      email: 'ahmet@example.com',
      passwordHash: customerHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      passwordChanged: true,
      phone: '+905551234567',
      company: 'Demo Şirketi',
      packageId: freePackage.id,
    },
  })

  // Demo müşteri için profil oluştur
  await prisma.profile.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      slug: 'ahmetdemir',
      displayName: 'Ahmet Demir',
      title: 'Yazılım Geliştirici',
      bio: 'Merhaba! Ben Ahmet, full-stack geliştirici olarak çalışıyorum.',
      theme: 'minimal',
      bgColor: '#f8fafc',
      isPublished: true,
      contacts: {
        create: [
          { type: 'PHONE', value: '+905551234567', label: 'İş', order: 0 },
          { type: 'EMAIL', value: 'ahmet@example.com', label: 'İş', order: 1 },
          { type: 'WHATSAPP', value: '+905551234567', label: 'WhatsApp', order: 2 },
        ],
      },
      socials: {
        create: [
          { platform: 'LINKEDIN', url: 'https://linkedin.com/in/ahmetdemir', order: 0 },
          { platform: 'GITHUB', url: 'https://github.com/ahmetdemir', order: 1 },
          { platform: 'TWITTER', url: 'https://twitter.com/ahmetdemir', order: 2 },
        ],
      },
    },
  })

  console.log(`Demo müşteri oluşturuldu: ${customer.username}`)
  // Landing page fiyatlandırma planlarını oluştur
  const pricingPlans = [
    {
      slug: 'klasik',
      displayName: 'Klasik',
      tagline: 'Bireysel kullanım için zarif PVC NFC kart.',
      price: 399,
      priceLabel: null,
      currency: '₺',
      period: 'tek seferlik',
      featured: false,
      features: JSON.stringify(['Mat PVC NFC kart', 'Ücretsiz dijital profil', 'Sosyal medya + iletişim', 'Sınırsız güncelleme']),
      ctaText: "Klasik'i Seç",
      sortOrder: 0,
      isActive: true,
    },
    {
      slug: 'metal',
      displayName: 'Metal',
      tagline: 'Lazer kazıma premium metal kart. İz bırak.',
      price: 899,
      priceLabel: null,
      currency: '₺',
      period: 'tek seferlik',
      featured: true,
      features: JSON.stringify(['Premium metal gövde', 'Lazer kazıma logo + isim', 'CV & portföy yükleme', 'Detaylı analitik paneli', 'Öncelikli destek']),
      ctaText: "Metal'i Seç",
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: 'kurumsal',
      displayName: 'Kurumsal',
      tagline: 'Ekipler ve şirketler için merkezi yönetim.',
      price: null,
      priceLabel: 'Teklif',
      currency: '',
      period: '',
      featured: false,
      features: JSON.stringify(['Toplu kart üretimi', 'Ekip yönetim paneli', 'Marka kimliği şablonu', 'Özel hesap yöneticisi']),
      ctaText: 'Teklif Al',
      sortOrder: 2,
      isActive: true,
    },
  ]

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }
  console.log('3 fiyatlandırma planı oluşturuldu.')

  console.log('\n--- SEED TAMAMLANDI ---')
  console.log('Admin girişi: superadmin / Admin1234!')
  console.log('Demo müşteri: ahmetdemir / Musteri123!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
