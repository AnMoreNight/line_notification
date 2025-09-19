import { z } from 'zod'

// User registration schemas
export const individualUserSchema = z.object({
  birthYear: z.number().min(1900).max(new Date().getFullYear()),
  residenceRegion: z.string().min(1, '居住地域を入力してください'),
})

export const corporateUserSchema = z.object({
  companyName: z.string().min(1, '会社名を入力してください'),
  storeName: z.string().min(1, '店舗名を入力してください'),
  departmentName: z.string().optional(),
  employeeName: z.string().min(1, '氏名を入力してください'),
  birthDate: z.string().min(1, '生年月日を入力してください'),
  contractExpiry: z.string().min(1, '契約期限を入力してください'),
})

export const certificationSchema = z.object({
  certificationType: z.string().min(1, '認定種別を入力してください'),
  expiryDate: z.string().min(1, '期限日を入力してください'),
  image: z.any().optional(),
})

// Company registration schema
export const companyRegistrationSchema = z.object({
  name: z.string().min(1, '会社名を入力してください'),
  contractExpiry: z.string().min(1, '契約期限を入力してください'),
})

// Notification schemas
export const notificationSchema = z.object({
  message: z.string().min(1, 'メッセージを入力してください'),
  notificationType: z.enum(['6months', '3months', '1week']),
  userId: z.string().min(1),
  certificationId: z.string().optional(),
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
})

export type IndividualUserInput = z.infer<typeof individualUserSchema>
export type CorporateUserInput = z.infer<typeof corporateUserSchema>
export type CertificationInput = z.infer<typeof certificationSchema>
export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>
export type NotificationInput = z.infer<typeof notificationSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
