'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { corporateUserSchema, type CorporateUserInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ArrowLeft, Building, Store, User, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

export default function CorporateRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorporateUserInput>({
    resolver: zodResolver(corporateUserSchema),
  })

  const onSubmit = async (data: CorporateUserInput) => {
    setIsLoading(true)
    try {
      // Store registration data in session storage for after LINE login
      sessionStorage.setItem('registrationData', JSON.stringify({
        type: 'corporate',
        data: data
      }))
      
      // Redirect to LINE login
      router.push('/auth/signin')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">薬剤師認定管理</span>
          </div>
          <p className="text-gray-600">法人向けサービスに登録</p>
        </div>

        {/* Registration Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>法人向け登録</CardTitle>
            <CardDescription>
              企業・組織としてサービスを利用します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4 mr-2" />
                  会社名
                </label>
                <Input
                  {...register('companyName')}
                  placeholder="株式会社○○薬局"
                  className="w-full"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              {/* Store Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Store className="h-4 w-4 mr-2" />
                  店舗名
                </label>
                <Input
                  {...register('storeName')}
                  placeholder="○○店"
                  className="w-full"
                />
                {errors.storeName && (
                  <p className="text-sm text-red-600">{errors.storeName.message}</p>
                )}
              </div>

              {/* Department Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 mr-2" />
                  部署名（任意）
                </label>
                <Input
                  {...register('departmentName')}
                  placeholder="調剤部、管理部など"
                  className="w-full"
                />
                {errors.departmentName && (
                  <p className="text-sm text-red-600">{errors.departmentName.message}</p>
                )}
              </div>

              {/* Employee Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  氏名
                </label>
                <Input
                  {...register('employeeName')}
                  placeholder="山田 太郎"
                  className="w-full"
                />
                {errors.employeeName && (
                  <p className="text-sm text-red-600">{errors.employeeName.message}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  生年月日
                </label>
                <Input
                  {...register('birthDate')}
                  type="date"
                  className="w-full"
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-600">{errors.birthDate.message}</p>
                )}
              </div>

              {/* Contract Expiry */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  契約期限
                </label>
                <Input
                  {...register('contractExpiry')}
                  type="date"
                  className="w-full"
                />
                {errors.contractExpiry && (
                  <p className="text-sm text-red-600">{errors.contractExpiry.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    処理中...
                  </div>
                ) : (
                  'LINEでログインして登録を完了'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>登録後は以下の情報も入力していただきます：</p>
          <ul className="mt-2 space-y-1">
            <li>• 研修認定期限</li>
            <li>• 研修認定薬剤師の画像</li>
            <li>• 従業員管理用の登録URL発行</li>
          </ul>
        </div>

        {/* Corporate Benefits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">法人向け特典</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ 従業員一括管理</p>
            <p>✓ 専用登録URL発行</p>
            <p>✓ 契約期限管理</p>
            <p>✓ 管理者ダッシュボード</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
