'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { corporateUserSchema, type CorporateUserInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ArrowLeft, Building, Store, User, Calendar, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  registrationUrl: string
  contractExpiry: string
  isActive: boolean
}

export default function CorporateEmployeeRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorporateUserInput>({
    resolver: zodResolver(corporateUserSchema),
  })

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${params.companyId}`)
        const data = await response.json()
        
        if (data.success) {
          setCompany(data.data)
        } else {
          setError(data.error || '会社情報を取得できませんでした')
        }
      } catch (error) {
        console.error('Company fetch error:', error)
        setError('会社情報の取得中にエラーが発生しました')
      } finally {
        setCompanyLoading(false)
      }
    }

    if (params.companyId) {
      fetchCompany()
    }
  }, [params.companyId])

  const onSubmit = async (data: CorporateUserInput) => {
    setIsLoading(true)
    try {
      // Store registration data in session storage for after LINE login
      sessionStorage.setItem('registrationData', JSON.stringify({
        type: 'corporate-employee',
        data: {
          ...data,
          companyId: params.companyId,
        }
      }))
      
      // Redirect to LINE login
      router.push('/auth/signin')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">エラー</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/">
              <Button>ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
          <p className="text-gray-600">従業員登録</p>
        </div>

        {/* Company Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Building className="h-5 w-5 mr-2" />
              所属会社
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-blue-900">{company.name}</p>
            <p className="text-sm text-blue-700">
              契約期限: {new Date(company.contractExpiry).toLocaleDateString('ja-JP')}
            </p>
          </CardContent>
        </Card>

        {/* Registration Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>従業員登録</CardTitle>
            <CardDescription>
              {company.name}の従業員として登録します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          </ul>
        </div>
      </div>
    </div>
  )
}
