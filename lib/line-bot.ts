import { Client, middleware, MiddlewareConfig } from '@line/bot-sdk'

// LINE Bot configuration
export const lineBotConfig: MiddlewareConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
}

export const lineBotClient = new Client(lineBotConfig)

// Create middleware
export const lineMiddleware = middleware(lineBotConfig)

// Helper function to send messages
export async function sendLineMessage(userId: string, message: string) {
  try {
    await lineBotClient.pushMessage(userId, {
      type: 'text',
      text: message,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending LINE message:', error)
    return { success: false, error }
  }
}

// Helper function to send rich messages
export async function sendLineRichMessage(userId: string, altText: string, template: unknown) {
  try {
    await lineBotClient.pushMessage(userId, {
      type: 'template',
      altText,
      template,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending LINE rich message:', error)
    return { success: false, error }
  }
}
