import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { certificationSchema } from '@/lib/validations'
import { calculateNotificationDates } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { lineUserId: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const certifications = await prisma.certification.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { expiryDate: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: certifications,
    })
  } catch (error) {
    console.error('Get certifications error:', error)
    return NextResponse.json(
      { success: false, error: '認定情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { lineUserId: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = certificationSchema.parse(body)

    // Create certification
    const certification = await prisma.certification.create({
      data: {
        userId: user.id,
        certificationType: validatedData.certificationType,
        expiryDate: new Date(validatedData.expiryDate),
        imageUrl: validatedData.imageUrl,
      },
    })

    // Create notification schedules
    const notificationDates = calculateNotificationDates(new Date(validatedData.expiryDate))
    
    await prisma.notificationSchedule.createMany({
      data: [
        {
          certificationId: certification.id,
          notificationType: '6months',
          scheduledDate: notificationDates.sixMonths,
        },
        {
          certificationId: certification.id,
          notificationType: '3months',
          scheduledDate: notificationDates.threeMonths,
        },
        {
          certificationId: certification.id,
          notificationType: '1week',
          scheduledDate: notificationDates.oneWeek,
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: '認定情報が登録されました',
      data: certification,
    })
  } catch (error) {
    console.error('Create certification error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: '入力データが正しくありません' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '認定情報の登録中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
