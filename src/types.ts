export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  DENTIST = 'dentist',
  DELIVERY = 'delivery'
}

export interface Region {
  id: string;
  name: string;
  code: string; // e.g., OR, SC, LP
  isActive: boolean;
  baseDeliveryTimeHours: number; // e.g. 48 or 72
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  clinicName?: string;
  address?: string;
  city: string;
  regionId: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  pinCode?: string; // 4-digit security PIN
  biometricEnabled?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  presentation: string; // e.g., "Jeringa de 4g", "Caja x 50 unidades"
  price: number; // in BOB (Bolivianos)
  stock: number;
  isActive: boolean;
  image: string; // URL or placeholder SVG representation
  technicalSpec?: string; // Manual or AI-generated
  useProtocol?: string; // Step-by-step clinical protocol
  scientificCitations?: string[]; // Papers/papers validating usage
  isAiGenerated?: boolean;
}

export enum OrderStatus {
  RECIBIDO = 'Recibido',
  CONSOLIDADO = 'Consolidado',
  SOLICITADO_PROVEEDOR = 'Solicitado al proveedor',
  EN_TRANSITO = 'En tránsito',
  RECIBIDO_ALMACEN = 'Recibido en almacén',
  EN_PREPARACION = 'En preparación',
  EN_RUTA = 'En ruta',
  ENTREGADO = 'Entregado',
  ENTREGADO_PARCIALMENTE = 'Entregado parcialmente',
  CANCELADO = 'Cancelado'
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  presentation: string;
  price: number;
  quantity: number;
  receivedQuantity?: number; // Used for warehouse verification
  deliveredQuantity?: number; // Used for delivery verification
}

export interface Order {
  id: string; // unique short ID (e.g., G-1002)
  clientId: string;
  clientName: string;
  clinicName: string;
  address: string;
  city: string;
  phone: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string;
  deliveryTimeHours: number; // Configured at time of order
  deliveryRiderId?: string; // Assigned delivery person
  deliveryRiderName?: string;
  notes?: string;
  deliverySignature?: string; // base64 or text SVG path
  deliveryPhoto?: string; // Mock or file path
  returns?: {
    type: 'parcial' | 'total';
    reason: string;
    itemsReturned: { productId: string; quantity: number }[];
  };
  masterOrderId?: string; // Linked Master Order
}

export interface MasterOrder {
  id: string; // unique ID (e.g., M-2026-06-30)
  createdAt: string;
  status: 'Creado' | 'Solicitado' | 'Recibido' | 'Distribuido';
  originCity: string; // Santa Cruz
  destinationCity: string; // Oruro
  items: {
    productId: string;
    productName: string;
    brand: string;
    totalRequested: number;
    totalReceived?: number;
    status: 'pending' | 'received_full' | 'received_partial';
  }[];
  orderIdsConsolidated: string[];
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'buy_x_get_y' | 'category_discount' | 'first_purchase_gift' | 'date_range';
  buyQty?: number;
  getQty?: number;
  discountPercent?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gayita';
  text: string;
  timestamp: string;
  citations?: { title: string; url?: string; snippet?: string }[];
  recommendedProductIds?: string[];
}
