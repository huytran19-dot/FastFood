// Role Middleware - Check user role
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const userRole = req.user.role?.name || req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Không có quyền truy cập',
        required: allowedRoles,
        current: userRole
      });
    }
    
    next();
  };
};

module.exports = roleMiddleware;
