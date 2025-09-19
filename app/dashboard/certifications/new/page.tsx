'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { certificationSchema, type CertificationInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, ArrowLeft, Calendar, FileText, Upload, X } from 'lucide-react'
import Link from 'next/link'

export default function NewCertificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

      if (file.size > maxSize) {
        alert('ファイルサイズは5MB以下にしてください')
        return
      }

      if (!allowedTypes.includes(file.type)) {
        alert('JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const onSubmit = async (data: CertificationInput) => {
    setIsLoading(true)
    try {
      let imageUrl = null

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      // Create certification
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          imageUrl,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/certifications')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '登録中にエラーが発生しました')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('登録中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/certifications">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  認定一覧に戻る
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">認定情報登録</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>新しい認定情報を登録</CardTitle>
              <CardDescription>
                研修認定の詳細情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Certification Type */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4 mr-2" />
                    認定種別
                  </label>
                  <select
                    {...register('certificationType')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">選択してください</option>
                    <option value="研修認定薬剤師">研修認定薬剤師</option>
                    <option value="薬剤師免許">薬剤師免許</option>
                    <option value="調剤薬局管理者">調剤薬局管理者</option>
                    <option value="その他">その他</option>
                  </select>
                  {errors.certificationType && (
                    <p className="text-sm text-red-600">{errors.certificationType.message}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    期限日
                  </label>
                  <Input
                    {...register('expiryDate')}
                    type="date"
                    className="w-full"
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Upload className="h-4 w-4 mr-2" />
                    認定画像（任意）
                  </label>
                  
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        画像をドラッグ&ドロップまたはクリックして選択
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ファイルを選択
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPEG、PNG、GIF、WebP形式、最大5MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrl || ''}
                          alt="Preview"
                          className="h-48 w-full object-contain border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        登録中...
                      </div>
                    ) : (
                      '認定情報を登録'
                    )}
                  </Button>
                  <Link href="/dashboard/certifications" className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                      キャンセル
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">通知について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>✓ 期限の6ヶ月前、3ヶ月前、1週間前にLINEで自動通知されます</p>
              <p>✓ 通知は登録したLINEアカウントに送信されます</p>
              <p>✓ 通知設定は後から変更できます</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
