import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { individualUserSchema, corporateUserSchema } from '@/lib/validations'
import { generateRandomString, generateRegistrationUrl } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'individual') {
      // Validate individual user data
      const validatedData = individualUserSchema.parse(data)
      
      // Update user with individual data
      const user = await prisma.user.update({
        where: { lineUserId: session.user.id },
        data: {
          birthYear: validatedData.birthYear,
          residenceRegion: validatedData.residenceRegion,
          role: 'INDIVIDUAL',
          status: 'ACTIVE',
        },
        include: { company: true },
      })

      return NextResponse.json({
        success: true,
        message: '個人ユーザーとして登録が完了しました',
        data: user,
      })
    } else if (type === 'corporate') {
      // Validate corporate user data
      const validatedData = corporateUserSchema.parse(data)
      
      // Generate unique registration URL for company
      const registrationUrl = generateRegistrationUrl(generateRandomString(12))
      
      // Create company first
      const company = await prisma.company.create({
        data: {
          name: validatedData.companyName,
          registrationUrl,
          contractExpiry: new Date(validatedData.contractExpiry),
        },
      })

      // Update user with corporate data
      const user = await prisma.user.update({
        where: { lineUserId: session.user.id },
        data: {
          role: 'CORPORATE',
          status: 'ACTIVE',
          companyId: company.id,
          storeName: validatedData.storeName,
          departmentName: validatedData.departmentName,
          employeeId: generateRandomString(8),
        },
        include: { company: true },
      })

      return NextResponse.json({
        success: true,
        message: '法人ユーザーとして登録が完了しました',
        data: { user, company },
      })
    } else {
      return NextResponse.json(
        { success: false, error: '無効な登録タイプです' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: '入力データが正しくありません' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '登録中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
