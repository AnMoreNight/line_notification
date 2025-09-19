import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a sample company
  const company = await prisma.company.create({
    data: {
      name: 'サンプル薬局株式会社',
      registrationUrl: 'https://your-domain.com/register/corporate/sample123',
      contractExpiry: new Date('2025-12-31'),
      isActive: true,
    },
  })

  console.log('Created company:', company.name)

  // Create sample users
  const individualUser = await prisma.user.create({
    data: {
      lineUserId: 'sample_individual_user',
      displayName: '田中 太郎',
      email: 'tanaka@example.com',
      role: 'INDIVIDUAL',
      status: 'ACTIVE',
      birthYear: 1985,
      residenceRegion: '東京都',
    },
  })

  const corporateUser = await prisma.user.create({
    data: {
      lineUserId: 'sample_corporate_user',
      displayName: '佐藤 花子',
      email: 'sato@example.com',
      role: 'CORPORATE',
      status: 'ACTIVE',
      companyId: company.id,
      storeName: '本店',
      departmentName: '調剤部',
      employeeId: 'EMP001',
    },
  })

  console.log('Created users:', individualUser.displayName, corporateUser.displayName)

  // Create sample certifications
  const certification1 = await prisma.certification.create({
    data: {
      userId: individualUser.id,
      certificationType: '研修認定薬剤師',
      expiryDate: new Date('2024-12-31'),
      imageUrl: '/uploads/sample_certification.jpg',
      isActive: true,
    },
  })

  const certification2 = await prisma.certification.create({
    data: {
      userId: corporateUser.id,
      certificationType: '薬剤師免許',
      expiryDate: new Date('2025-06-30'),
      isActive: true,
    },
  })

  console.log('Created certifications:', certification1.certificationType, certification2.certificationType)

  // Create notification schedules
  const now = new Date()
  const sixMonthsBefore = new Date(certification1.expiryDate)
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6)
  
  const threeMonthsBefore = new Date(certification1.expiryDate)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)
  
  const oneWeekBefore = new Date(certification1.expiryDate)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)

  await prisma.notificationSchedule.createMany({
    data: [
      {
        certificationId: certification1.id,
        notificationType: '6months',
        scheduledDate: sixMonthsBefore,
        isSent: false,
      },
      {
        certificationId: certification1.id,
        notificationType: '3months',
        scheduledDate: threeMonthsBefore,
        isSent: false,
      },
      {
        certificationId: certification1.id,
        notificationType: '1week',
        scheduledDate: oneWeekBefore,
        isSent: false,
      },
    ],
  })

  console.log('Created notification schedules')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
