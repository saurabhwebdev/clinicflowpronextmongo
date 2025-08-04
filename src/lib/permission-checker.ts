import connectDB from './mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  userRoles?: string[];
  requiredPermissions?: string[];
}

export async function checkUserPermission(
  userId: string,
  route: string,
  method: string = 'GET'
): Promise<PermissionCheckResult> {
  try {
    await connectDB();
    
    // Get user with roles and permissions
    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          match: { isActive: true }
        }
      });
    
    if (!user) {
      return {
        hasPermission: false,
        reason: 'User not found'
      };
    }
    
    // Check if user has master_admin role (full access)
    if (user.role === 'master_admin') {
      return {
        hasPermission: true,
        userRoles: [user.role]
      };
    }
    
    // Get all permissions for the user through their roles
    const userPermissions = new Set<string>();
    const userRoles: string[] = [];
    
    // Add permissions from user's role field (legacy)
    if (user.role) {
      userRoles.push(user.role);
    }
    
    // Add permissions from user's roles array (new RBAC)
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        if (role.isActive) {
          userRoles.push(role.name);
          if (role.permissions) {
            for (const permission of role.permissions) {
              userPermissions.add(`${permission.route}:${permission.method}`);
            }
          }
        }
      }
    }
    
    // Check if user has the specific permission
    const requiredPermission = `${route}:${method}`;
    const hasPermission = userPermissions.has(requiredPermission);
    
    return {
      hasPermission,
      userRoles,
      requiredPermissions: [requiredPermission],
      reason: hasPermission ? undefined : 'User does not have required permission'
    };
  } catch (error) {
    console.error('Error checking user permission:', error);
    return {
      hasPermission: false,
      reason: 'Error checking permissions'
    };
  }
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          match: { isActive: true }
        }
      });
    
    if (!user) {
      return [];
    }
    
    const permissions = new Set<string>();
    
    // Add permissions from user's roles array
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        if (role.isActive && role.permissions) {
          for (const permission of role.permissions) {
            permissions.add(`${permission.route}:${permission.method}`);
          }
        }
      }
    }
    
    return Array.from(permissions);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    await connectDB();
    
    const user = await User.findById(userId).populate('roles');
    
    if (!user) {
      return [];
    }
    
    const roles: string[] = [];
    
    // Add legacy role
    if (user.role) {
      roles.push(user.role);
    }
    
    // Add roles from roles array
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        if (role.isActive) {
          roles.push(role.name);
        }
      }
    }
    
    return roles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

export function normalizeRoute(route: string): string {
  // Remove query parameters
  const cleanRoute = route.split('?')[0];
  
  // Normalize dynamic routes
  return cleanRoute.replace(/\[([^\]]+)\]/g, ':$1');
} 