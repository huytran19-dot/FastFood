import { FaUser, FaShoppingCart } from "react-icons/fa";
import logo from "../../static/images/Domino's_pizza_logo.svg.png";

export default function Header() {
  return (
    <header className="w-full bg-[#0078ae] text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Text */}
        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Domino's Pizza"
            className="h-8" // giảm size logo
          />
          <span className="text-base font-semibold">Domino's Pizza</span>
        </div>

        {/* Menu */}
        <nav className="flex space-x-4 text-xs font-medium uppercase">
          <a href="#" className="hover:text-yellow-300">Mã e-voucher</a>
          <a href="#" className="hover:text-yellow-300">Khuyến mãi</a>
          <a href="#" className="hover:text-yellow-300">Thực đơn</a>
          <a href="#" className="hover:text-yellow-300">Theo dõi đơn hàng</a>
          <a href="#" className="hover:text-yellow-300">Danh sách cửa hàng</a>
          <a href="#" className="hover:text-yellow-300">Blog</a>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4 text-lg">
          <button className="hover:text-yellow-300">
            <FaUser />
          </button>
          <button className="hover:text-yellow-300 relative">
            <FaShoppingCart />
            {/* Badge giỏ hàng */}
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              0
            </span>
          </button>
        </div>
      </div>
    </header>

  );
}
