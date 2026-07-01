import { Product, Category, Region, UserProfile, Order, MasterOrder, Promotion, AuditLog } from '../types';
import { SEED_REGIONS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_USERS, SEED_PROMOTIONS, SEED_HISTORIC_ORDERS, SEED_AUDIT_LOGS } from '../data/seedData';

const KEYS = {
  REGIONS: 'gaiadent_regions',
  CATEGORIES: 'gaiadent_categories',
  PRODUCTS: 'gaiadent_products',
  USERS: 'gaiadent_users',
  ORDERS: 'gaiadent_orders',
  MASTER_ORDERS: 'gaiadent_master_orders',
  PROMOTIONS: 'gaiadent_promotions',
  AUDIT_LOGS: 'gaiadent_audit_logs',
  CURRENT_USER: 'gaiadent_current_user',
  CART: 'gaiadent_cart'
};

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from storage:`, error);
    return defaultValue;
  }
};

export const setStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key} to storage:`, error);
  }
};

export const initializeGaiadentStorage = (): void => {
  if (!localStorage.getItem(KEYS.REGIONS)) {
    localStorage.setItem(KEYS.REGIONS, JSON.stringify(SEED_REGIONS));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(SEED_HISTORIC_ORDERS));
  }
  if (!localStorage.getItem(KEYS.MASTER_ORDERS)) {
    localStorage.setItem(KEYS.MASTER_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PROMOTIONS)) {
    localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(SEED_PROMOTIONS));
  }
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[2])); // Default to Dentist 1 (Alejandro)
  }
};

export const GaiadentStorage = {
  getRegions: (): Region[] => getStorageData<Region[]>(KEYS.REGIONS, SEED_REGIONS),
  setRegions: (data: Region[]) => setStorageData(KEYS.REGIONS, data),

  getCategories: (): Category[] => getStorageData<Category[]>(KEYS.CATEGORIES, SEED_CATEGORIES),
  setCategories: (data: Category[]) => setStorageData(KEYS.CATEGORIES, data),

  getProducts: (): Product[] => getStorageData<Product[]>(KEYS.PRODUCTS, SEED_PRODUCTS),
  setProducts: (data: Product[]) => setStorageData(KEYS.PRODUCTS, data),

  getUsers: (): UserProfile[] => getStorageData<UserProfile[]>(KEYS.USERS, SEED_USERS),
  setUsers: (data: UserProfile[]) => setStorageData(KEYS.USERS, data),

  getOrders: (): Order[] => getStorageData<Order[]>(KEYS.ORDERS, SEED_HISTORIC_ORDERS),
  setOrders: (data: Order[]) => setStorageData(KEYS.ORDERS, data),

  getMasterOrders: (): MasterOrder[] => getStorageData<MasterOrder[]>(KEYS.MASTER_ORDERS, []),
  setMasterOrders: (data: MasterOrder[]) => setStorageData(KEYS.MASTER_ORDERS, data),

  getPromotions: (): Promotion[] => getStorageData<Promotion[]>(KEYS.PROMOTIONS, SEED_PROMOTIONS),
  setPromotions: (data: Promotion[]) => setStorageData(KEYS.PROMOTIONS, data),

  getAuditLogs: (): AuditLog[] => getStorageData<AuditLog[]>(KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS),
  setAuditLogs: (data: AuditLog[]) => setStorageData(KEYS.AUDIT_LOGS, data),

  getCurrentUser: (): UserProfile => getStorageData<UserProfile>(KEYS.CURRENT_USER, SEED_USERS[2]),
  setCurrentUser: (user: UserProfile) => setStorageData(KEYS.CURRENT_USER, user),

  getCart: (): { productId: string; quantity: number }[] => getStorageData<{ productId: string; quantity: number }[]>(KEYS.CART, []),
  setCart: (cart: { productId: string; quantity: number }[]) => setStorageData(KEYS.CART, cart),

  addAuditLog: (userId: string, userName: string, role: string, action: string, details: string) => {
    const logs = getStorageData<AuditLog[]>(KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      role: role as any,
      action,
      details
    };
    logs.unshift(newLog);
    setStorageData(KEYS.AUDIT_LOGS, logs);
    return logs;
  }
};
