import { Router } from 'express'
import { randomUUID } from 'crypto'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const teamRouter = Router()

// GET /customer/team
teamRouter.get('/', async (req, res, next) => {
  try {
    const [members, pkg] = await Promise.all([
      prisma.teamMember.findMany({
        where: { ownerId: req.user!.userId },
        include: {
          member: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { package: { select: { maxTeamMembers: true } } },
      }),
    ])

    res.json({
      success: true,
      data: {
        members,
        memberCount: members.length,
        maxTeamMembers: pkg?.package.maxTeamMembers ?? 1,
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /customer/team/invite
teamRouter.post('/invite', async (req, res, next) => {
  try {
    const { email, role } = req.body as { email: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER' }

    if (!email || !role || !['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
      throw new AppError(400, 'Geçersiz istek. Email ve rol zorunlu.')
    }

    const owner = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { package: { select: { maxTeamMembers: true } } },
    })

    const currentCount = await prisma.teamMember.count({ where: { ownerId: req.user!.userId } })
    const maxMembers = owner?.package.maxTeamMembers ?? 1

    if (currentCount >= maxMembers) {
      throw new AppError(403, `Paket limitinize ulaştınız. Maksimum ${maxMembers} üye eklenebilir.`)
    }

    // Kendi kendini davet etmeyi engelle
    const ownerUser = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { email: true } })
    if (ownerUser?.email === email) {
      throw new AppError(400, 'Kendinizi davet edemezsiniz.')
    }

    // Kullanıcı mevcut mu?
    const targetUser = await prisma.user.findUnique({ where: { email } })

    if (targetUser) {
      // Zaten üye mi?
      const alreadyMember = await prisma.teamMember.findUnique({
        where: { ownerId_memberId: { ownerId: req.user!.userId, memberId: targetUser.id } },
      })
      if (alreadyMember) throw new AppError(409, 'Bu kullanıcı zaten ekibinizde.')

      await prisma.teamMember.create({
        data: { ownerId: req.user!.userId, memberId: targetUser.id, role },
      })
      res.json({ success: true, message: 'Kullanıcı ekibe eklendi.', invited: false })
    } else {
      // Davet oluştur
      const existing = await prisma.teamInvitation.findFirst({
        where: { ownerId: req.user!.userId, email },
      })
      if (existing) {
        await prisma.teamInvitation.delete({ where: { id: existing.id } })
      }

      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await prisma.teamInvitation.create({
        data: { ownerId: req.user!.userId, email, token, expiresAt },
      })
      res.json({ success: true, message: 'Davet gönderildi.', invited: true, token })
    }
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/team/:memberId
teamRouter.delete('/:memberId', async (req, res, next) => {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { ownerId: req.user!.userId, memberId: req.params.memberId },
    })
    if (!member) throw new AppError(404, 'Üye bulunamadı.')

    await prisma.teamMember.delete({ where: { id: member.id } })
    res.json({ success: true, message: 'Üye ekipten çıkarıldı.' })
  } catch (err) {
    next(err)
  }
})

// GET /customer/team/invitations
teamRouter.get('/invitations', async (req, res, next) => {
  try {
    const invitations = await prisma.teamInvitation.findMany({
      where: { ownerId: req.user!.userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: invitations })
  } catch (err) {
    next(err)
  }
})

// POST /customer/team/accept?token=xxx
teamRouter.post('/accept', async (req, res, next) => {
  try {
    const token = req.query.token as string
    if (!token) throw new AppError(400, 'Token gerekli.')

    const invitation = await prisma.teamInvitation.findUnique({ where: { token } })
    if (!invitation) throw new AppError(404, 'Geçersiz veya süresi dolmuş davet.')
    if (invitation.expiresAt < new Date()) {
      await prisma.teamInvitation.delete({ where: { id: invitation.id } })
      throw new AppError(410, 'Davet süresi dolmuş.')
    }

    await prisma.teamMember.create({
      data: { ownerId: invitation.ownerId, memberId: req.user!.userId, role: 'VIEWER' },
    })
    await prisma.teamInvitation.delete({ where: { id: invitation.id } })

    res.json({ success: true, message: 'Ekibe katıldınız.' })
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/team/invitations/:id
teamRouter.delete('/invitations/:id', async (req, res, next) => {
  try {
    const inv = await prisma.teamInvitation.findFirst({
      where: { id: req.params.id, ownerId: req.user!.userId },
    })
    if (!inv) throw new AppError(404, 'Davet bulunamadı.')
    await prisma.teamInvitation.delete({ where: { id: inv.id } })
    res.json({ success: true, message: 'Davet iptal edildi.' })
  } catch (err) {
    next(err)
  }
})
