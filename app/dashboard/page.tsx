'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, User, Building, Calendar, Plus, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  lineUserId: string
  name: string
  email?: string
  image?: string
  role: 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  companyId?: string
  company?: {
    id: string
    name: string
    registrationUrl: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      setUser(session.user as User)
      setIsLoading(false)
    }
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ユーザー情報を取得できませんでした</h2>
          <Button onClick={() => router.push('/auth/signin')}>
            ログイン画面に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">薬剤師認定管理</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            こんにちは、{user.name}さん
          </h1>
          <p className="text-gray-600">
            {user.role === 'INDIVIDUAL' ? '個人向けサービス' : '法人向けサービス'}をご利用いただき、ありがとうございます。
          </p>
        </div>

        {/* Status Alert */}
        {user.status === 'PENDING' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    登録が完了していません
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    認定情報の登録を完了してください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                認定情報を追加
              </CardTitle>
              <CardDescription>
                新しい研修認定情報を登録します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/certifications/new">
                <Button className="w-full">追加する</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                認定一覧
              </CardTitle>
              <CardDescription>
                登録済みの認定情報を確認・編集
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/certifications">
                <Button variant="outline" className="w-full">一覧を見る</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                設定
              </CardTitle>
              <CardDescription>
                通知設定やプロフィール編集
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full">設定する</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Corporate Features */}
        {user.role === 'CORPORATE' && user.company && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  会社情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-medium">会社名:</span> {user.company.name}</p>
                  <p><span className="font-medium">登録URL:</span></p>
                  <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                    {user.company.registrationUrl}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  従業員管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  従業員の認定情報を一括管理できます
                </p>
                <Link href="/dashboard/employees">
                  <Button className="w-full">従業員一覧を見る</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
            <CardDescription>
              最近の通知や更新履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>まだ活動がありません</p>
              <p className="text-sm">認定情報を登録すると、ここに表示されます</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
