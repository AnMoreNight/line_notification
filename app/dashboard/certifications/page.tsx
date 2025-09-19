'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Calendar, Plus, ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Certification {
  id: string
  certificationType: string
  expiryDate: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CertificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchCertifications()
    }
  }, [session, status, router])

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/certifications')
      const data = await response.json()
      
      if (data.success) {
        setCertifications(data.data)
      }
    } catch (error) {
      console.error('Error fetching certifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCertification = async (id: string) => {
    if (!confirm('この認定情報を削除しますか？')) return

    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCertifications(certifications.filter(cert => cert.id !== id))
      }
    } catch (error) {
      console.error('Error deleting certification:', error)
    }
  }

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50' }
    if (diffDays <= 30) return { status: 'expiring', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (diffDays <= 90) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { status: 'valid', color: 'text-green-600', bg: 'bg-green-50' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ダッシュボードに戻る
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">認定情報管理</span>
              </div>
            </div>
            <Link href="/dashboard/certifications/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規登録
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総認定数</p>
                  <p className="text-2xl font-bold">{certifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">期限切れ</p>
                  <p className="text-2xl font-bold text-red-600">
                    {certifications.filter(cert => getExpiryStatus(cert.expiryDate).status === 'expired').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">30日以内</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {certifications.filter(cert => getExpiryStatus(cert.expiryDate).status === 'expiring').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">90日以内</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {certifications.filter(cert => getExpiryStatus(cert.expiryDate).status === 'warning').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications List */}
        <Card>
          <CardHeader>
            <CardTitle>認定情報一覧</CardTitle>
            <CardDescription>
              登録済みの認定情報と期限状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">まだ認定情報が登録されていません</p>
                <Link href="/dashboard/certifications/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    最初の認定情報を登録
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((certification) => {
                  const expiryStatus = getExpiryStatus(certification.expiryDate)
                  const now = new Date()
                  const expiry = new Date(certification.expiryDate)
                  const diffTime = expiry.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                  return (
                    <Card key={certification.id} className={`border-l-4 ${
                      expiryStatus.status === 'expired' ? 'border-l-red-500' :
                      expiryStatus.status === 'expiring' ? 'border-l-orange-500' :
                      expiryStatus.status === 'warning' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{certification.certificationType}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                                {expiryStatus.status === 'expired' ? '期限切れ' :
                                 expiryStatus.status === 'expiring' ? '30日以内' :
                                 expiryStatus.status === 'warning' ? '90日以内' :
                                 '有効'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>期限日: {formatDate(certification.expiryDate)}</p>
                              <p>
                                {diffDays < 0 ? `期限切れから ${Math.abs(diffDays)} 日経過` :
                                 diffDays === 0 ? '今日が期限日' :
                                 `期限まで ${diffDays} 日`}
                              </p>
                              <p>登録日: {formatDate(certification.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/certifications/${certification.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCertification(certification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {certification.imageUrl && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-600 mb-2">認定画像</p>
                            <img
                              src={certification.imageUrl}
                              alt={certification.certificationType}
                              className="h-32 w-auto rounded border"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
