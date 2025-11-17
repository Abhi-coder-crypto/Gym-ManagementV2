import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token from cookie
 * Attaches user data to req.user if token is valid
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from cookie
    const token = req.cookies?.accessToken;
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      });
    }
    
    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Authentication failed.' 
    });
  }
}

/**
 * Authorization middleware - checks if user has required role
 */
export function requireRole(...allowedRoles: Array<'client' | 'admin' | 'trainer'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions. Admin access required.' 
      });
    }
    
    next();
  };
}

/**
 * Admin-only middleware - shorthand for requireRole('admin')
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

/**
 * Client-only middleware - shorthand for requireRole('client')
 */
export function requireClient(req: Request, res: Response, next: NextFunction) {
  return requireRole('client')(req, res, next);
}

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}

/**
 * Resource ownership middleware - verifies user owns the resource OR is admin
 * Use this for client-scoped routes like /api/clients/:clientId/videos
 * Checks if req.params.clientId matches req.user.clientId OR if user is admin
 */
export function requireOwnershipOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }
  
  // Admins can access any resource
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Get clientId from route params (could be :clientId or :id)
  const resourceClientId = req.params.clientId || req.params.id;
  
  // Check if user owns this resource
  if (req.user.clientId && req.user.clientId.toString() === resourceClientId) {
    return next();
  }
  
  // User doesn't own the resource and isn't admin
  return res.status(403).json({ 
    message: 'Access denied. You can only access your own data.' 
  });
}
