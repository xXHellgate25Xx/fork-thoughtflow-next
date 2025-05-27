import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'admin' | 'salesperson' | 'user' | null;

export interface Permission {
  resource: string;
  actions: string[];
}

interface CRMState {
  currentEmployeeName: string | null | undefined;
  isAdmin: boolean;
  userRole: UserRole;
  permissions: Permission[];
  isLoading: boolean;
}

const initialState: CRMState = {
  currentEmployeeName: undefined,
  isAdmin: false,
  userRole: null,
  permissions: [],
  isLoading: false
};

export const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setCRMAuth: (state, action: PayloadAction<{
      role: UserRole;
      employeeName: string | null;
      permissions: Permission[];
    }>) => {
      const { role, employeeName, permissions } = action.payload;
      state.userRole = role;
      state.currentEmployeeName = employeeName;
      state.isAdmin = role === 'admin';
      state.permissions = permissions;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearCRMAuth: (state) => initialState
  }
});

// Export actions
export const { setCRMAuth, setLoading, clearCRMAuth } = crmSlice.actions;

const selectCRMState = (state: { crm: CRMState }) => state.crm;

export interface SelectCRMAuth {
  canAccessCRM: boolean;
  canManageEmployees: boolean;
  canViewAllOpportunities: boolean;
  canEditOpportunities: boolean;
  isAdmin: boolean;
  currentEmployee: string | undefined;
  permissions: Permission[];
  userRole: UserRole;
}

export const selectCRMAuth = createSelector(
  [selectCRMState],
  (crm): SelectCRMAuth => ({
    canAccessCRM: crm.isAdmin || crm.userRole === 'salesperson',
    canManageEmployees: crm.isAdmin,
    canViewAllOpportunities: crm.isAdmin,
    canEditOpportunities: crm.isAdmin || crm.userRole === 'salesperson',
    isAdmin: crm.isAdmin,
    userRole: crm.userRole,
    currentEmployee: crm.currentEmployeeName || undefined,
    permissions: crm.permissions
  })
);

export default crmSlice.reducer; 