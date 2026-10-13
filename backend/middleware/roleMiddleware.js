/**
 * Role-Based Authorization Middleware
 * 
 * Restricts access to routes based on user roles.
 * Must be used AFTER authMiddleware (so req.user exists).
 * 
 * Usage:
 *   router.get('/admin-only', authMiddleware, authorizeRoles('admin'), controller)
 *   router.get('/multi-role', authMiddleware, authorizeRoles('customer', 'merchant'), controller)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
