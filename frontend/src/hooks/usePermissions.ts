import { useAuthStore } from '../store/authStore';

export type FeatureKey = 
  | 'cms_marketing' 
  | 'academic_enrollment' 
  | 'staff_registry' 
  | 'admissions_portal' 
  | 'finance_bursary' 
  | 'student_registry' 
  | 'branding_identity';

export function usePermissions() {
  const user = useAuthStore(state => state.user);

  const hasPermission = (feature: FeatureKey): boolean => {
    if (!user) return false;
    
    // Super Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Instructors have no admin permissions (currently)
    if (user.role === 'instructor') return false;

    // Staff check their permissions array
    if (user.role === 'staff') {
      return user.permissions?.includes(feature) || false;
    }

    return false;
  };

  return { hasPermission };
}
