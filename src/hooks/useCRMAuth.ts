import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalContext } from 'src/GlobalContextProvider';
import { UserRole, selectCRMAuth, setCRMAuth } from '../libs/redux/crmSlice';
 
export const useCRMAuth = () => {
  const dispatch = useDispatch();
  const crmAuth = useSelector(selectCRMAuth);
  const { jwtToken } = useGlobalContext();
  // const { records: owners, isLoading: ownersLoading } = useTeamMembers();

  // Decode JWT token
  // const userEmail = useMemo(() => {
  //   if (!jwtToken) return null;
  //   try {
  //     return jwtDecode<{ email?: string }>(jwtToken).email;
  //   } catch (error) {
  //     console.error('Error decoding JWT:', error);
  //     return null;
  //   }
  // }, [jwtToken]);

  // Find employee and role based on email
  // const userInfo = useMemo(() => {
  //   const defaultInfo = {
  //     role: 'Owner',
  //     email: userEmail,
  //     employeeId: null,
  //     employeeName: null,
  //     roleLoaded: !ownersLoading
  //   };

  //   try {
  //     if (!userEmail || !owners || owners.length === 0) {
  //       return defaultInfo;
  //     }

  //     const currentEmployee = owners.find(
  //       emp => emp['Personal Email'] && userEmail &&
  //         emp['Personal Email'].toLowerCase() === userEmail.toLowerCase()
  //     );
  //     console.log(currentEmployee);
  //     if (currentEmployee) {
  //       return {
  //         role: currentEmployee.Position || 'Owner',
  //         email: userEmail,
  //         employeeId: currentEmployee.id ? String(currentEmployee.id) : null,
  //         employeeName: currentEmployee['Full-name'] || null,
  //         roleLoaded: true
  //       };
  //     }

  //     return {
  //       ...defaultInfo,
  //       roleLoaded: true
  //     };
  //   } catch (error) {
  //     console.error('Error finding employee role:', error);
  //     return {
  //       ...defaultInfo,
  //       roleLoaded: true
  //     };
  //   }
  // }, [userEmail, owners, ownersLoading]);
  // Sync with CRM state when employee info is loaded
  useEffect(() => {
    if (!crmAuth.currentEmployee ) {
      const role: UserRole = 'admin'
      dispatch(setCRMAuth({
        role,
        employeeName: "", 
        permissions: role === 'admin' ? [{ resource: '*', actions: ['*'] }] :
          role === 'salesperson' ? [
            { resource: 'opportunities', actions: ['read', 'write'] },
            { resource: 'leads', actions: ['read', 'write'] }
          ] : []
      }));
    }
  }, [crmAuth.currentEmployee,    dispatch]);
 
  // useEffect(() => {
  //   if (!crmAuth.currentEmployee && userInfo.roleLoaded) {
  //     const role: UserRole = userInfo.role === 'Admin' ? 'admin' :
  //       userInfo.role === 'Owner' ? 'salesperson' :
  //           'user';
  //     dispatch(setCRMAuth({
  //       role,
  //       employeeName: userInfo.employeeName, 
  //       permissions: role === 'admin' ? [{ resource: '*', actions: ['*'] }] :
  //         role === 'salesperson' ? [
  //           { resource: 'opportunities', actions: ['read', 'write'] },
  //           { resource: 'leads', actions: ['read', 'write'] }
  //         ] : []
  //     }));
  //   }
  // }, [crmAuth.currentEmployee, userInfo, owners, dispatch]);
 

  const checkPermission = (resource: string, action: string) => {
    if (crmAuth.isAdmin) return true;

    const hasWildcardPermission = crmAuth.permissions.some(
      (permission) =>
        (permission.resource === '*' && permission.actions.includes('*')) ||
        (permission.resource === resource && permission.actions.includes('*')) ||
        (permission.resource === '*' && permission.actions.includes(action))
    );

    if (hasWildcardPermission) return true;

    return crmAuth.permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.actions.includes(action)
    );
  };

  const hasRole = (requiredRole: 'admin' | 'salesperson' | 'user') => {
    if (crmAuth.isAdmin) return true;
    if (!crmAuth.currentEmployee) return false;

    switch (requiredRole) {
      case 'admin':
        return crmAuth.isAdmin;
      case 'salesperson':
        return crmAuth.canAccessCRM;
      case 'user':
        return true;
      default:
        return false;
    }
  };
 

  return {
    ...crmAuth, 
    checkPermission,
    hasRole,
    // userInfo,
    isAuthenticated: crmAuth.currentEmployee !== null && crmAuth.currentEmployee !== undefined,
  };
}; 