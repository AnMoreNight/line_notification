import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bell, Users, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">薬剤師認定管理</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button>新規登録</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            薬剤師認定期限を
            <span className="text-blue-600"> LINEで自動通知</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            研修認定期限の管理を自動化し、期限が近づいた際にLINEでお知らせします。
            個人・法人向けに対応し、重要な期限を見逃すことなく安心して業務に集中できます。
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                今すぐ始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register/corporate">
              <Button variant="outline" size="lg" className="text-lg px-8">
                法人向けサービス
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>自動通知システム</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                期限の6ヶ月前、3ヶ月前、1週間前に自動でLINE通知を送信します。
                手動での管理は不要です。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>個人・法人対応</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                個人の薬剤師から企業まで、様々な規模に対応。
                法人向けには従業員管理機能も提供します。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>セキュアな管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                個人情報は暗号化され、安全に管理されます。
                LINEログインによる認証で、簡単かつ安全にアクセスできます。
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">使い方</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">LINEでログイン</h3>
              <p className="text-sm text-gray-600">LINEアカウントで簡単ログイン</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">情報を登録</h3>
              <p className="text-sm text-gray-600">認定情報と期限を入力</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">自動通知</h3>
              <p className="text-sm text-gray-600">期限前にLINEで通知</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">更新管理</h3>
              <p className="text-sm text-gray-600">期限更新も簡単管理</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めませんか？</h2>
          <p className="text-xl mb-8 opacity-90">
            無料で始められ、重要な期限を見逃すことがなくなります
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              無料で始める
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 薬剤師認定管理システム. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
