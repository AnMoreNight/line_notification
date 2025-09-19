'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, User, Building, Calendar, Plus, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Employee {
  id: string
  displayName: string
  email?: string
  profilePictureUrl?: string
  storeName?: string
  departmentName?: string
  employeeId?: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  createdAt: string
  certifications: {
    id: string
    certificationType: string
    expiryDate: string
    isActive: boolean
  }[]
}

export default function EmployeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user && session.user.role === 'CORPORATE') {
      fetchEmployees()
    } else {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/companies/employees')
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyRegistrationUrl = async () => {
    if (session?.user?.company?.registrationUrl) {
      try {
        await navigator.clipboard.writeText(session.user.company.registrationUrl)
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
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
                <span className="text-2xl font-bold text-gray-900">従業員管理</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Company Info */}
        {session?.user?.company && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                会社情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">会社名</p>
                  <p className="font-medium">{session.user.company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">従業員登録URL</p>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 p-2 rounded text-sm font-mono flex-1 break-all">
                      {session.user.company.registrationUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyRegistrationUrl}
                    >
                      {copiedUrl ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees List */}
        <Card>
          <CardHeader>
            <CardTitle>従業員一覧</CardTitle>
            <CardDescription>
              登録済みの従業員とその認定情報
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">まだ従業員が登録されていません</p>
                <p className="text-sm text-gray-400">
                  従業員登録URLを共有して、従業員に登録してもらってください
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {employee.profilePictureUrl ? (
                            <img
                              src={employee.profilePictureUrl}
                              alt={employee.displayName}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{employee.displayName}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {employee.storeName && (
                                <p>店舗: {employee.storeName}</p>
                              )}
                              {employee.departmentName && (
                                <p>部署: {employee.departmentName}</p>
                              )}
                              {employee.employeeId && (
                                <p>従業員ID: {employee.employeeId}</p>
                              )}
                              <p>登録日: {formatDate(employee.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800'
                              : employee.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status === 'ACTIVE' ? 'アクティブ' : 
                             employee.status === 'PENDING' ? '登録中' : '非アクティブ'}
                          </span>
                        </div>
                      </div>

                      {/* Certifications */}
                      {employee.certifications.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            認定情報
                          </h4>
                          <div className="space-y-2">
                            {employee.certifications.map((cert) => (
                              <div key={cert.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                  <p className="font-medium">{cert.certificationType}</p>
                                  <p className="text-sm text-gray-600">
                                    期限: {formatDate(cert.expiryDate)}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cert.isActive 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {cert.isActive ? '有効' : '無効'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
