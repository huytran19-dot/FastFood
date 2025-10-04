import { FaFacebookF, FaInstagram } from "react-icons/fa";
import logo from "../../static/images/Domino's_pizza_logo.svg.png";


export default function Footer() {
  return (
    <footer className="bg-[#006699] text-white py-8 mt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-white/30 pb-6">
          {/* Cột 1: Logo + Hotline */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <img
              src={logo}
              alt="Domino's Logo"
              className="h-12"
            />
            <p className="italic">📞 Hotline Đặt Hàng</p>
            <p className="text-yellow-400 font-bold text-2xl">1900 6099</p>
          </div>

          {/* Cột 2: Menu link */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-200">
            <a href="#" className="hover:text-yellow-300">Blog</a>
            <a href="#" className="hover:text-yellow-300">Thực Đơn</a>
            <a href="#" className="hover:text-yellow-300">Theo Dõi Đơn Hàng</a>
            <a href="#" className="hover:text-yellow-300">Tuyển Dụng</a>
            <a href="#" className="hover:text-yellow-300">Mã e-voucher</a>
            <a href="#" className="hover:text-yellow-300">Danh Sách Cửa Hàng</a>
            <a href="#" className="hover:text-yellow-300">Chính Sách</a>
            <a href="#" className="hover:text-yellow-300">Khuyến Mãi</a>
            <a href="#" className="hover:text-yellow-300">Rewards</a>
          </div>

          {/* Cột 3: Social + Payment */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <p className="font-semibold">Kết Nối Domino's Pizza Việt Nam:</p>
            <div className="flex space-x-4 text-xl">
              <a href="#" className="hover:text-yellow-300">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-yellow-300">
                <FaInstagram />
              </a>
            </div>
            <div className="flex space-x-3 mt-3">
              <img
                src="https://1000logos.net/wp-content/uploads/2017/03/MasterCard-Logo-1996.png"
                alt="MasterCard"
                className="h-8 bg-white rounded"
              />
              <img
                src="https://cdn.dominos.vn/bocongthuong.png"
                alt="Bộ Công Thương"
                className="h-8"
              />
            </div>
            <button className="bg-[#005080] hover:bg-[#004060] text-white px-4 py-2 rounded mt-4">
              Switch To English Version
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-200 mt-4">
          © 2025 Domino’s Pizza Vietnam | Privacy Policy
        </div>
      </div>
    </footer>
  );
}
