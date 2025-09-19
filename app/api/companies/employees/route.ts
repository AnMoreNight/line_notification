import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      include: { company: true },
    })

    if (!user || user.role !== 'CORPORATE' || !user.companyId) {
      return NextResponse.json(
        { success: false, error: '法人ユーザーではありません' },
        { status: 403 }
      )
    }

    // Get all employees of the company
    const employees = await prisma.user.findMany({
      where: { 
        companyId: user.companyId,
        role: 'CORPORATE', // Corporate employees
      },
      include: {
        certifications: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: employees,
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json(
      { success: false, error: '従業員情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
