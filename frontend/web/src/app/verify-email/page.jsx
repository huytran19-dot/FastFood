import { useState, useEffect, useRef } from "react"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [status, setStatus] = useState('pending') // pending | verifying | success | error
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  const token = searchParams.get('token')
  const email = location.state?.email || ''
  
  // Use ref to track if verification was already attempted
  const verificationAttempted = useRef(false)

  useEffect(() => {
    // If token is in URL and we haven't verified yet, verify automatically
    if (token && !verificationAttempted.current) {
      verificationAttempted.current = true
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken) => {
    setStatus('verifying')
    try {
      const response = await authAPI.verifyEmail(verificationToken)
      setStatus('success')
      setMessage(response.message || 'Email đã được xác thực thành công!')
      
      toast({
        title: 'Xác thực thành công!',
        description: 'Bạn có thể đăng nhập ngay bây giờ.',
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Xác thực email thất bại')
      
      toast({
        variant: 'destructive',
        title: 'Xác thực thất bại',
        description: error.message,
      })
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không tìm thấy email. Vui lòng đăng ký lại.',
      })
      return
    }

    setIsResending(true)
    try {
      await authAPI.resendVerification(email)
      
      toast({
        title: 'Đã gửi lại email!',
        description: 'Vui lòng kiểm tra hộp thư của bạn.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gửi lại email thất bại',
        description: error.message,
      })
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Đang xác thực email...</h3>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Xác thực thành công!</h3>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Đang chuyển đến trang đăng nhập...</p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Xác thực thất bại</h3>
            <p className="text-muted-foreground mb-6">{message}</p>
            {email && (
              <Button onClick={handleResendEmail} disabled={isResending}>
                {isResending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
              </Button>
            )}
          </div>
        )

      default: // pending
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-4">
                <Mail className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Kiểm tra email của bạn</h3>
            <p className="text-muted-foreground mb-6">
              Chúng tôi đã gửi link xác thực đến email: <br />
              <strong>{email}</strong>
            </p>
            
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  📧 Vui lòng làm theo các bước sau:
                </p>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Mở email từ FastFood</li>
                  <li>Nhấn vào nút "Xác thực Email"</li>
                  <li>Bạn sẽ được chuyển về trang này tự động</li>
                </ol>
              </div>

              <div className="text-sm text-muted-foreground">
                Không nhận được email?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium text-primary"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? 'Đang gửi...' : 'Gửi lại'}
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Xác thực Email</CardTitle>
            <CardDescription>
              {status === 'pending' && 'Hoàn tất đăng ký tài khoản'}
              {status === 'verifying' && 'Đang xác thực...'}
              {status === 'success' && 'Thành công!'}
              {status === 'error' && 'Có lỗi xảy ra'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
