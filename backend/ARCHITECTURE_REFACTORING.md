# Backend Architecture Refactoring

## 📁 New Structure

```
backend/src/
├── index.js                    # Server setup & routes mounting ONLY (85 lines)
├── controllers/
│   ├── authControllers.js      # Login, signup (customer & owner)
│   ├── userControllers.js      # User profile operations
│   ├── restaurantControllers.js # Restaurant CRUD & stats
│   ├── adminControllers.js     # Admin operations (users & restaurants)
│   ├── adminAuthControllers.js # Admin authentication
│   ├── restaurantAuthControllers.js # Restaurant authentication
│   └── uploadController.js     # File upload
├── routes/
│   ├── authRoutes.js           # /api/auth/*
│   ├── userRoutes.js           # /api/users/*
│   ├── restaurantRoutes.js     # /api/restaurants/*
│   ├── adminRoutes.js          # /api/admin/* (new admin routes)
│   ├── adminAuthRoutes.js      # /api/admin/* (existing auth)
│   ├── restaurantAuthRoutes.js # /api/restaurant/*
│   └── uploadRoutes.js         # /api/upload/*
├── middlewares/
│   ├── auth.js                 # JWT authentication middleware
│   ├── role.js                 # Role-based access control
│   └── upload.js               # File upload middleware
├── services/
│   ├── adminAuthServices.js
│   ├── restaurantAuthServices.js
│   └── uploadService.js
└── models/
    └── ... (Sequelize models)
```

## ✅ What Changed

### Before:
- ❌ `index.js`: 500+ lines with ALL logic
- ❌ Controllers exist but NOT used for restaurant features
- ❌ No separation of concerns
- ❌ Hard to maintain and test

### After:
- ✅ `index.js`: ~85 lines (server setup + route mounting ONLY)
- ✅ All logic moved to appropriate controllers
- ✅ Middleware separated into `middlewares/`
- ✅ Clear separation of concerns (MVC pattern)
- ✅ Easy to test and maintain

## 🔗 API Routes Mapping

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/login           → authControllers.login
POST   /api/auth/signup-user     → authControllers.signupUser
POST   /api/auth/signup-owner    → authControllers.signupOwner
```

### User Routes (`/api/users`) - Auth Required
```
GET    /api/users/me             → userControllers.getCurrentUser
PUT    /api/users/me             → userControllers.updateProfile
```

### Restaurant Routes (`/api/restaurants`) - Restaurant Role Required
```
GET    /api/public/restaurants   → restaurantControllers.getPublicRestaurants (public)
POST   /api/restaurants          → restaurantControllers.createRestaurant
GET    /api/restaurants/mine     → restaurantControllers.getMyRestaurant
PUT    /api/restaurants/mine     → restaurantControllers.updateMyRestaurant
GET    /api/restaurants/stats    → restaurantControllers.getRestaurantStats
```

### Admin Routes (`/api/admin`) - Admin Role Required
```
# User Management
GET    /api/admin/users                    → adminControllers.getAllUsers
PATCH  /api/admin/users/:id/status         → adminControllers.toggleUserStatus
DELETE /api/admin/users/:id                → adminControllers.deleteUser

# Restaurant Management  
GET    /api/admin/restaurants              → adminControllers.getAllRestaurants
PUT    /api/admin/restaurants/:id/approve  → adminControllers.approveRestaurant
PUT    /api/admin/restaurants/:id/reject   → adminControllers.rejectRestaurant
PUT    /api/admin/restaurants/:id/toggle-status → adminControllers.toggleRestaurantStatus
```

## 🎯 Benefits

1. **Maintainability**: Each file has single responsibility
2. **Testability**: Controllers can be tested independently
3. **Scalability**: Easy to add new features
4. **Readability**: Clear structure, easy to navigate
5. **Reusability**: Middlewares and services can be reused
6. **Separation of Concerns**: MVC pattern properly implemented

## 🚀 Next Steps (Optional)

1. ✅ Add validation middleware (express-validator)
2. ✅ Add service layer for business logic
3. ✅ Add error handling middleware
4. ✅ Add request logging (morgan)
5. ✅ Add API documentation (Swagger)
6. ✅ Add unit tests (Jest)

## 📝 Migration Notes

- All existing routes still work (backward compatible)
- Old routes (`/api/admin/*`, `/api/restaurant/*`) preserved
- New cleaner routes added (`/api/auth/*`, `/api/users/*`, `/api/restaurants/*`)
- Can gradually migrate frontend to use new routes
