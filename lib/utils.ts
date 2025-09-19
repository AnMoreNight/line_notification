import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, addMonths, subMonths, subWeeks, isAfter, isBefore } from 'date-fns'
import { ja } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: Date | string, formatStr: string = 'yyyy年MM月dd日') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: ja })
}

export function calculateNotificationDates(expiryDate: Date) {
  const sixMonthsBefore = subMonths(expiryDate, 6)
  const threeMonthsBefore = subMonths(expiryDate, 3)
  const oneWeekBefore = subWeeks(expiryDate, 1)

  return {
    sixMonths: sixMonthsBefore,
    threeMonths: threeMonthsBefore,
    oneWeek: oneWeekBefore,
  }
}

export function isNotificationDue(notificationDate: Date): boolean {
  const now = new Date()
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  return isAfter(notificationDate, now) && isBefore(notificationDate, oneDayFromNow)
}

// Generate unique registration URL for companies
export function generateRegistrationUrl(companyId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/register/corporate/${companyId}`
}

// Generate random string for company registration URLs
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// File upload utilities
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズは5MB以下にしてください' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です' }
  }

  return { valid: true }
}

// Notification message templates
export function getNotificationMessage(
  type: '6months' | '3months' | '1week',
  certificationType: string,
  expiryDate: Date
): string {
  const formattedDate = formatDate(expiryDate)
  
  switch (type) {
    case '6months':
      return `【重要なお知らせ】\n${certificationType}の期限が6ヶ月後に迫っています。\n期限日: ${formattedDate}\n\n早めの更新手続きをお勧めします。`
    case '3months':
      return `【重要なお知らせ】\n${certificationType}の期限が3ヶ月後に迫っています。\n期限日: ${formattedDate}\n\n更新手続きを開始してください。`
    case '1week':
      return `【緊急】\n${certificationType}の期限が1週間後に迫っています！\n期限日: ${formattedDate}\n\n至急更新手続きを行ってください。`
    default:
      return `【お知らせ】\n${certificationType}の期限が近づいています。\n期限日: ${formattedDate}`
  }
}
