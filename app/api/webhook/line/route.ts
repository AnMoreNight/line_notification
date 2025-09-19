import { NextRequest, NextResponse } from 'next/server'
import { lineMiddleware, lineBotClient } from '@/lib/line-bot'
import { prisma } from '@/lib/prisma'
import { WebhookEvent } from '@line/bot-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const events = lineMiddleware.parse(body, signature) as WebhookEvent[]

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await handleTextMessage(event)
      } else if (event.type === 'follow') {
        await handleFollowEvent(event)
      } else if (event.type === 'unfollow') {
        await handleUnfollowEvent(event)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleTextMessage(event: WebhookEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') return

  const userId = event.source.userId
  const messageText = event.message.text

  if (!userId) return

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: { lineUserId: userId },
  })

  if (!user) {
    // Send welcome message for new users
    await lineBotClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'こんにちは！薬剤師認定管理システムへようこそ。\n\nまずはWebサイトでアカウント登録を行ってください。\n\n登録URL: https://your-domain.com/register',
    })
    return
  }

  // Handle different message types
  if (messageText.includes('認定') || messageText.includes('期限')) {
    // Show user's certifications
    const certifications = await prisma.certification.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { expiryDate: 'asc' },
    })

    if (certifications.length === 0) {
      await lineBotClient.replyMessage(event.replyToken, {
        type: 'text',
        text: 'まだ認定情報が登録されていません。\n\nWebサイトで認定情報を登録してください。\n\nダッシュボード: https://your-domain.com/dashboard',
      })
    } else {
      let message = '【登録済み認定情報】\n\n'
      certifications.forEach((cert, index) => {
        const expiryDate = cert.expiryDate.toLocaleDateString('ja-JP')
        message += `${index + 1}. ${cert.certificationType}\n期限: ${expiryDate}\n\n`
      })
      message += '詳細はダッシュボードで確認できます。\nhttps://your-domain.com/dashboard'

      await lineBotClient.replyMessage(event.replyToken, {
        type: 'text',
        text: message,
      })
    }
  } else if (messageText.includes('ヘルプ') || messageText.includes('help')) {
    await lineBotClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '【利用可能なコマンド】\n\n• 認定 - 認定情報を確認\n• 期限 - 期限情報を確認\n• ヘルプ - このメッセージを表示\n\n詳細な管理はWebサイトで行えます。\nhttps://your-domain.com/dashboard',
    })
  } else {
    // Default response
    await lineBotClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'こんにちは！\n\n「認定」と送信すると認定情報を確認できます。\n「ヘルプ」と送信すると利用可能なコマンドが表示されます。\n\n詳細な管理はWebサイトで行えます。\nhttps://your-domain.com/dashboard',
    })
  }
}

async function handleFollowEvent(event: WebhookEvent) {
  if (event.type !== 'follow') return

  const userId = event.source.userId
  if (!userId) return

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: { lineUserId: userId },
  })

  if (user) {
    await lineBotClient.replyMessage(event.replyToken, {
      type: 'text',
      text: `${user.displayName}さん、おかえりなさい！\n\n「認定」と送信すると認定情報を確認できます。\n詳細な管理はWebサイトで行えます。\nhttps://your-domain.com/dashboard`,
    })
  } else {
    await lineBotClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'こんにちは！薬剤師認定管理システムへようこそ。\n\nまずはWebサイトでアカウント登録を行ってください。\n\n登録URL: https://your-domain.com/register',
    })
  }
}

async function handleUnfollowEvent(event: WebhookEvent) {
  if (event.type !== 'unfollow') return

  const userId = event.source.userId
  if (!userId) return

  // Update user status to inactive
  await prisma.user.updateMany({
    where: { lineUserId: userId },
    data: { status: 'INACTIVE' },
  })
}
