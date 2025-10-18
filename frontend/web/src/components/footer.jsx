import { Plane } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">FastFood Drone</span>
            </div>
            <p className="text-sm text-muted-foreground">Đặt đồ ăn nhanh chóng, giao hàng bằng drone hiện đại</p>
          </div>

          {/* About Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-foreground">
                  Cách hoạt động
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-foreground">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground">
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Pháp lý</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} FastFood Drone. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  )
}
