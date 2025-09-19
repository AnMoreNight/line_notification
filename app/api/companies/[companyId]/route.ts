import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { 
        registrationUrl: {
          contains: params.companyId
        }
      },
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: '会社が見つかりません' },
        { status: 404 }
      )
    }

    if (!company.isActive) {
      return NextResponse.json(
        { success: false, error: 'この会社の登録は無効です' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        registrationUrl: company.registrationUrl,
        contractExpiry: company.contractExpiry?.toISOString(),
        isActive: company.isActive,
      },
    })
  } catch (error) {
    console.error('Get company error:', error)
    return NextResponse.json(
      { success: false, error: '会社情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
