'use client'

import { useState, useEffect } from 'react'
import { 
  instagramAuthService, 
  InstagramAuthConfig,
  InstagramBusinessAccount 
} from '@/services/instagram-auth'
import { 
  instagramRelationshipService,
  InstagramRelationshipConfig 
} from '@/services/instagram-relationship'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Instagram, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface InstagramConnectionWizardProps {
  username?: string
  onConnectionComplete?: (relationship: any) => void
  onConnectionError?: (error: Error) => void
  className?: string
}

interface ConnectionStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
}

export default function InstagramConnectionWizard({ 
  username = 'eisho8400',
  onConnectionComplete,
  onConnectionError,
  className = ''
}: InstagramConnectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [businessAccounts, setBusinessAccounts] = useState<InstagramBusinessAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<InstagramBusinessAccount | null>(null)
  const [authUrl, setAuthUrl] = useState<string>('')
  const [authCode, setAuthCode] = useState<string>('')

  const steps: ConnectionStep[] = [
    {
      id: 'auth',
      title: 'Instagram認証',
      description: 'Instagramビジネスアカウントにアクセスを許可',
      status: 'pending'
    },
    {
      id: 'account_selection',
      title: 'アカウント選択',
      description: '連携するビジネスアカウントを選択',
      status: 'pending'
    },
    {
      id: 'connection',
      title: '接続確立',
      description: 'Instagramデータの同期を開始',
      status: 'pending'
    },
    {
      id: 'complete',
      title: '接続完了',
      description: 'Instagram連携が完了しました',
      status: 'pending'
    }
  ]

  useEffect(() => {
    // Check if already authenticated
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = instagramAuthService.isAuthenticated()
        if (isAuthenticated) {
          // Skip to account selection
          setCurrentStep(1)
          await loadBusinessAccounts()
        }
      } catch (error) {
        console.error('Auth status check failed:', error)
      }
    }

    checkAuthStatus()
  }, [])

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      setConnectionError(`Instagram認証エラー: ${error}`)
      updateStepStatus(0, 'error')
      return
    }

    if (code && currentStep === 0) {
      setAuthCode(code)
      handleAuthCallback(code)
    }
  }, [])

  const updateStepStatus = (stepIndex: number, status: ConnectionStep['status']) => {
    const newSteps = [...steps]
    newSteps[stepIndex].status = status
    // Update current step if completed successfully
    if (status === 'completed' && stepIndex === currentStep) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const initializeAuth = async () => {
    try {
      setIsConnecting(true)
      setConnectionError(null)
      updateStepStatus(0, 'in_progress')

      // Initialize Instagram auth service
      const config: InstagramAuthConfig = {
        clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '',
        clientSecret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}${window.location.pathname}`,
        scope: [
          'instagram_basic',
          'instagram_content_publish',
          'pages_show_list',
          'pages_read_engagement'
        ]
      }

      if (!config.clientId || !config.clientSecret) {
        throw new Error('Instagram API credentials not configured')
      }

      instagramAuthService.initialize(config)
      
      // Generate auth URL
      const url = instagramAuthService.getAuthUrl()
      setAuthUrl(url)
      
      // Redirect to Instagram auth
      window.location.href = url
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setConnectionError(error instanceof Error ? error.message : '認証の初期化に失敗しました')
      updateStepStatus(0, 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAuthCallback = async (code: string) => {
    try {
      setIsConnecting(true)
      updateStepStatus(0, 'in_progress')

      // Complete OAuth flow
      await instagramAuthService.completeOAuthFlow(code)
      
      updateStepStatus(0, 'completed')
      
      // Load business accounts
      await loadBusinessAccounts()
    } catch (error) {
      console.error('Auth callback failed:', error)
      setConnectionError(error instanceof Error ? error.message : '認証コールバックに失敗しました')
      updateStepStatus(0, 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const loadBusinessAccounts = async () => {
    try {
      setIsConnecting(true)
      updateStepStatus(1, 'in_progress')

      const accounts = await instagramAuthService.getBusinessAccounts()
      setBusinessAccounts(accounts)
      
      if (accounts.length === 0) {
        throw new Error('ビジネスアカウントが見つかりません')
      }
      
      if (accounts.length === 1) {
        // Auto-select if only one account
        setSelectedAccount(accounts[0])
        updateStepStatus(1, 'completed')
      } else {
        // Let user choose
        updateStepStatus(1, 'pending')
      }
    } catch (error) {
      console.error('Failed to load business accounts:', error)
      setConnectionError(error instanceof Error ? error.message : 'ビジネスアカウントの読み込みに失敗しました')
      updateStepStatus(1, 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAccountSelection = (account: InstagramBusinessAccount) => {
    setSelectedAccount(account)
    updateStepStatus(1, 'completed')
  }

  const establishConnection = async () => {
    if (!selectedAccount) {
      setConnectionError('ビジネスアカウントを選択してください')
      return
    }

    try {
      setIsConnecting(true)
      setConnectionError(null)
      updateStepStatus(2, 'in_progress')

      // Initialize relationship service
      const config: InstagramRelationshipConfig = {
        authConfig: {
          clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '',
          clientSecret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET || '',
          redirectUri: `${window.location.origin}${window.location.pathname}`,
          scope: [
            'instagram_basic',
            'instagram_content_publish',
            'pages_show_list',
            'pages_read_engagement'
          ]
        },
        autoSync: true,
        syncInterval: 1000 * 60 * 30, // 30 minutes
        enableAnalytics: true,
        enableRealTimeUpdates: true
      }

      instagramRelationshipService.initialize(config)

      // Connect business account
      const relationship = await instagramRelationshipService.connectBusinessAccount(username)
      
      updateStepStatus(2, 'completed')
      updateStepStatus(3, 'completed')
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      
      onConnectionComplete?.(relationship)
    } catch (error) {
      console.error('Connection establishment failed:', error)
      setConnectionError(error instanceof Error ? error.message : '接続の確立に失敗しました')
      updateStepStatus(2, 'error')
      onConnectionError?.(error as Error)
    } finally {
      setIsConnecting(false)
    }
  }

  const resetConnection = () => {
    setCurrentStep(0)
    setConnectionError(null)
    setBusinessAccounts([])
    setSelectedAccount(null)
    setAuthCode('')
    // Reset all steps
    steps.forEach((_, index) => updateStepStatus(index, 'pending'))
  }

  const getStepIcon = (step: ConnectionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Instagramビジネス連携</CardTitle>
            <CardDescription>
              Instagramビジネスアカウントと連携して、投稿データや分析情報を取得します
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h3>
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      完了
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Error */}
        {connectionError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 0 && steps[0].status === 'pending' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Instagramビジネスアカウントにアクセスするための認証を行います
              </p>
              <Button 
                onClick={initializeAuth}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    認証中...
                  </>
                ) : (
                  <>
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagramで認証
                  </>
                )}
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              {businessAccounts.length > 1 && (
                <>
                  <p className="text-sm text-gray-600">
                    連携するInstagramビジネスアカウントを選択してください：
                  </p>
                  <div className="space-y-2">
                    {businessAccounts.map((account) => (
                      <div
                        key={account.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAccount?.id === account.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAccountSelection(account)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{account.name}</h4>
                            <p className="text-sm text-gray-500">
                              ID: {account.id}
                            </p>
                          </div>
                          {selectedAccount?.id === account.id && (
                            <CheckCircle className="h-5 w-5 text-pink-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {selectedAccount && (
                <Button 
                  onClick={establishConnection}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      接続中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      接続を確立
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {currentStep === 2 && steps[2].status === 'in_progress' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto" />
              <p className="text-sm text-gray-600">
                Instagramデータを取得・同期しています...
              </p>
            </div>
          )}

          {currentStep === 3 && steps[3].status === 'completed' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">接続完了！</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Instagramビジネスアカウントとの連携が正常に完了しました。
                  データの同期が自動的に開始されます。
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                ダッシュボードを更新
              </Button>
            </div>
          )}
        </div>

        {/* Reset Connection */}
        {connectionError && (
          <div className="pt-4 border-t">
            <Button 
              onClick={resetConnection}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              接続設定をリセット
            </Button>
          </div>
        )}

        {/* Manual Auth URL (for debugging) */}
        {authUrl && process.env.NODE_ENV === 'development' && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">開発用：手動認証URL</p>
            <a 
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              認証ページを開く
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}