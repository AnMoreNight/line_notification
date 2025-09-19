import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { lineBotClient } from '@/lib/line-bot'
import { getNotificationMessage, isNotificationDue } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled task
    const now = new Date()
    
    // Find all scheduled notifications that are due
    const dueNotifications = await prisma.notificationSchedule.findMany({
      where: {
        isSent: false,
        scheduledDate: {
          lte: now,
        },
      },
      include: {
        certification: {
          include: {
            user: true,
          },
        },
      },
    })

    const results = []

    for (const schedule of dueNotifications) {
      try {
        const user = schedule.certification.user
        
        // Check if user is active and has LINE user ID
        if (user.status === 'ACTIVE' && user.lineUserId) {
          const message = getNotificationMessage(
            schedule.notificationType as '6months' | '3months' | '1week',
            schedule.certification.certificationType,
            schedule.certification.expiryDate
          )

          // Send LINE message
          const lineResult = await lineBotClient.pushMessage(user.lineUserId, {
            type: 'text',
            text: message,
          })

          if (lineResult) {
            // Create notification record
            await prisma.notification.create({
              data: {
                userId: user.id,
                certificationId: schedule.certification.id,
                message,
                notificationType: schedule.notificationType,
                sentAt: now,
                isRead: false,
              },
            })

            // Mark schedule as sent
            await prisma.notificationSchedule.update({
              where: { id: schedule.id },
              data: { isSent: true },
            })

            results.push({
              success: true,
              userId: user.id,
              notificationType: schedule.notificationType,
            })
          }
        }
      } catch (error) {
        console.error(`Failed to send notification for schedule ${schedule.id}:`, error)
        results.push({
          success: false,
          scheduleId: schedule.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${dueNotifications.length} notifications`,
      results,
    })
  } catch (error) {
    console.error('Notification sending error:', error)
    return NextResponse.json(
      { success: false, error: '通知送信中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testUserId = searchParams.get('userId')
    const testType = searchParams.get('type') as '6months' | '3months' | '1week'

    if (!testUserId || !testType) {
      return NextResponse.json(
        { success: false, error: 'userId and type parameters are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      include: {
        certifications: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' },
          take: 1,
        },
      },
    })

    if (!user || user.certifications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User or certification not found' },
        { status: 404 }
      )
    }

    const certification = user.certifications[0]
    const message = getNotificationMessage(
      testType,
      certification.certificationType,
      certification.expiryDate
    )

    if (user.lineUserId) {
      await lineBotClient.pushMessage(user.lineUserId, {
        type: 'text',
        text: message,
      })

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        data: { message, userId: user.lineUserId },
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'User has no LINE user ID' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { success: false, error: 'テスト通知送信中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
