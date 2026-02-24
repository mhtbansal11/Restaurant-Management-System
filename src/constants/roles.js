export const ROLES = {
  ALL: ['superadmin', 'owner', 'manager', 'cashier', 'receptionist', 'kitchen_staff', 'waiter'],
  MANAGEMENT: ['superadmin', 'owner', 'manager'],
  POS: ['superadmin', 'owner', 'manager', 'cashier', 'waiter', 'receptionist'],
  KITCHEN: ['superadmin', 'owner', 'manager', 'kitchen_staff'],
  FRONT_DESK: ['superadmin', 'owner', 'manager', 'receptionist', 'waiter'],
  FINANCE: ['superadmin', 'owner', 'manager', 'cashier'],
};
