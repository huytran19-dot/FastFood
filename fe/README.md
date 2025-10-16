# FastFood Drone - React + Vite Application

A modern food delivery application with drone delivery tracking, built with React and Vite.

## 🚀 Tech Stack

- **React 18.3** - UI library
- **Vite 5.4** - Build tool and dev server
- **React Router 6** - Client-side routing
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📁 Project Structure

```
├── src/
│   ├── main.jsx          # Application entry point
│   └── App.jsx           # Main app component with routing
├── app/                  # Page components
│   ├── page.jsx          # Home page
│   ├── account/          # Account management
│   ├── admin/            # Admin dashboard
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout flow
│   ├── login/            # Authentication
│   ├── orders/           # Order management
│   ├── owner/            # Restaurant owner dashboard
│   ├── restaurant/       # Restaurant details
│   └── tracking/         # Order tracking
├── components/           # Reusable components
│   ├── ui/              # UI component library
│   ├── header.jsx
│   ├── footer.jsx
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── public/              # Static assets

```

## 🎨 Features

- 🛸 Drone delivery tracking with real-time map
- 🍔 Restaurant browsing and menu management
- 🛒 Shopping cart with item customization
- 📦 Order tracking and history
- 👤 User account management
- 🏪 Restaurant owner dashboard
- 👨‍💼 Admin panel for system management
- 📱 Responsive mobile-first design
- 🌙 Dark mode support (via theme provider)

## 🔧 Configuration

### Path Aliases

The project uses `@/` as an alias for the root directory. This is configured in:
- `vite.config.js` - For Vite bundler
- `jsconfig.json` - For IDE intellisense

### Tailwind CSS

TailwindCSS is configured in `tailwind.config.js` with custom theme extensions.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Routing

The application uses React Router for client-side routing. All routes are defined in `src/App.jsx`:

- `/` - Home page
- `/restaurant/:id` - Restaurant details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history
- `/tracking/:orderId` - Track order
- `/account` - User account
- `/owner/*` - Restaurant owner dashboard
- `/admin/*` - Admin panel

## 🎯 Migration Notes

This project was migrated from Next.js + TypeScript to React + Vite + JavaScript:

- All `.tsx` files converted to `.jsx`
- TypeScript type annotations removed
- Next.js `Link` replaced with React Router `Link`
- Next.js `useRouter` replaced with React Router `useNavigate` and `useParams`
- Next.js `Image` replaced with standard `<img>` tags
- Server-side rendering removed (now client-side only)
- API routes need to be implemented separately (backend API)

## 📄 License

Private project
