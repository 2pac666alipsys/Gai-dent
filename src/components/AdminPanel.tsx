import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Order, OrderStatus, UserProfile, MasterOrder, Promotion, UserRole } from '../types';
import { GaiadentStorage } from '../utils/storage';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  ListFilter,
  CheckCircle,
  Truck,
  Users,
  Tag,
  BarChart2,
  FileText,
  Map,
  RefreshCw,
  TrendingUp,
  Download,
  Search,
  Check,
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface AdminPanelProps {
  currentUser: UserProfile;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'master' | 'clients' | 'promotions' | 'reports' | 'map'>('orders');
  
  // Storage data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [masterOrders, setMasterOrders] = useState<MasterOrder[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');

  // Modals / Forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New Product form fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPresent, setProdPresent] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodImage, setProdImage] = useState('composite');

  // New Promotion fields
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoType, setPromoType] = useState<'buy_x_get_y' | 'category_discount' | 'first_purchase_gift' | 'date_range'>('buy_x_get_y');
  const [promoBuyQty, setPromoBuyQty] = useState(5);
  const [promoGetQty, setPromoGetQty] = useState(1);
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [promoCategory, setPromoCategory] = useState('');

  // Rider Assignments
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');

  // Master Order Verification modal
  const [isMasterVerifyOpen, setIsMasterVerifyOpen] = useState(false);
  const [verifyingMaster, setVerifyingMaster] = useState<MasterOrder | null>(null);
  const [tempReceivedQuantities, setTempReceivedQuantities] = useState<Record<string, number>>({});

  // Dentist management states
  const [isDentistModalOpen, setIsDentistModalOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState<UserProfile | null>(null);
  const [dentistName, setDentistName] = useState('');
  const [dentistEmail, setDentistEmail] = useState('');
  const [dentistPhone, setDentistPhone] = useState('');
  const [dentistClinic, setDentistClinic] = useState('');
  const [dentistAddress, setDentistAddress] = useState('');
  const [dentistPin, setDentistPin] = useState('');
  const [dentistIsActive, setDentistIsActive] = useState(true);

  const handleOpenDentistModal = (dent: UserProfile | null = null) => {
    if (dent) {
      setEditingDentist(dent);
      setDentistName(dent.name);
      setDentistEmail(dent.email);
      setDentistPhone(dent.phone);
      setDentistClinic(dent.clinicName || '');
      setDentistAddress(dent.address || '');
      setDentistPin(dent.pinCode || '');
      setDentistIsActive(dent.isActive);
    } else {
      setEditingDentist(null);
      setDentistName('');
      setDentistEmail('');
      setDentistPhone('');
      setDentistClinic('');
      setDentistAddress('');
      setDentistPin('');
      setDentistIsActive(true);
    }
    setIsDentistModalOpen(true);
  };

  const handleSaveDentist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dentistName || !dentistEmail || !dentistPhone) return;

    let updatedList: UserProfile[];
    if (editingDentist) {
      updatedList = users.map(u => u.id === editingDentist.id ? {
        ...u,
        name: dentistName,
        email: dentistEmail,
        phone: dentistPhone,
        clinicName: dentistClinic,
        address: dentistAddress,
        pinCode: dentistPin || undefined,
        isActive: dentistIsActive
      } : u);
      alert(`Ficha del Dr(a). ${dentistName} modificada con éxito.`);
      GaiadentStorage.addAuditLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Modificar Odontólogo',
        `Se editó la cuenta del odontólogo: ${dentistName}`
      );
    } else {
      const newDent: UserProfile = {
        id: `usr-dent-${Date.now()}`,
        role: UserRole.DENTIST,
        name: dentistName,
        email: dentistEmail,
        phone: dentistPhone,
        clinicName: dentistClinic,
        address: dentistAddress,
        city: currentUser.city || 'Oruro',
        regionId: currentUser.regionId || 'reg-oruro',
        isActive: true,
        pinCode: dentistPin || undefined
      };
      updatedList = [...users, newDent];
      alert(`Odontólogo ${dentistName} registrado en el sistema.`);
      GaiadentStorage.addAuditLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Crear Odontólogo',
        `Se registró un nuevo odontólogo: ${dentistName}`
      );
    }

    GaiadentStorage.setUsers(updatedList);
    setUsers(updatedList);
    setIsDentistModalOpen(false);
  };

  const handleDeleteDentist = (usrId: string, name: string) => {
    if (confirm(`¿Está seguro de que desea eliminar permanentemente la cuenta de ${name}? Esta acción es irreversible.`)) {
      const updated = users.filter(u => u.id !== usrId);
      GaiadentStorage.setUsers(updated);
      setUsers(updated);
      GaiadentStorage.addAuditLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Eliminar Odontólogo',
        `Se eliminó la cuenta del odontólogo: ${name}`
      );
      alert(`Cuenta del Dr(a). ${name} eliminada con éxito.`);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(GaiadentStorage.getOrders());
    setProducts(GaiadentStorage.getProducts());
    setCategories(GaiadentStorage.getCategories());
    setUsers(GaiadentStorage.getUsers());
    setMasterOrders(GaiadentStorage.getMasterOrders());
    setPromotions(GaiadentStorage.getPromotions());
    setAuditLogs(GaiadentStorage.getAuditLogs());
    
    // Auto-select first category in form if any
    const cats = GaiadentStorage.getCategories();
    if (cats.length > 0 && !prodCategoryId) {
      setProdCategoryId(cats[0].id);
      setPromoCategory(cats[0].id);
    }
  };

  // Product Operations
  const handleOpenProductModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdBrand(prod.brand);
      setProdCategoryId(prod.categoryId);
      setProdDesc(prod.description);
      setProdPresent(prod.presentation);
      setProdPrice(prod.price);
      setProdStock(prod.stock);
      setProdImage(prod.image);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdBrand('');
      setProdCategoryId(categories[0]?.id || '');
      setProdDesc('');
      setProdPresent('');
      setProdPrice(100);
      setProdStock(20);
      setProdImage('composite');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const allProds = GaiadentStorage.getProducts();

    if (editingProduct) {
      // Edit mode
      const updated = allProds.map(p => p.id === editingProduct.id ? {
        ...p,
        name: prodName,
        brand: prodBrand,
        categoryId: prodCategoryId,
        description: prodDesc,
        presentation: prodPresent,
        price: prodPrice,
        stock: prodStock,
        image: prodImage
      } : p);
      GaiadentStorage.setProducts(updated);
      GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Editar Producto', `Se modificó la ficha de ${prodName}.`);
    } else {
      // Create mode
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: prodName,
        brand: prodBrand,
        categoryId: prodCategoryId,
        description: prodDesc,
        presentation: prodPresent,
        price: prodPrice,
        stock: prodStock,
        isActive: true,
        image: prodImage
      };
      allProds.unshift(newProd);
      GaiadentStorage.setProducts(allProds);
      GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Registrar Producto', `Se registró el producto ${prodName} en catálogo.`);
    }

    setIsProductModalOpen(false);
    loadData();
    alert('Catálogo de insumos odontológicos actualizado.');
  };

  const handleToggleProduct = (prodId: string) => {
    const all = GaiadentStorage.getProducts().map(p => p.id === prodId ? { ...p, isActive: !p.isActive } : p);
    GaiadentStorage.setProducts(all);
    loadData();
  };

  const handleDeleteProduct = (prodId: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar el producto ${name} del catálogo?`)) {
      const all = GaiadentStorage.getProducts().filter(p => p.id !== prodId);
      GaiadentStorage.setProducts(all);
      GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Eliminar Producto', `Se eliminó del catálogo el insumo: ${name}`);
      loadData();
    }
  };

  // Promotion Operations
  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: Promotion = {
      id: `prom-${Date.now()}`,
      name: promoName,
      description: promoDesc,
      type: promoType,
      buyQty: promoType === 'buy_x_get_y' ? promoBuyQty : undefined,
      getQty: promoType === 'buy_x_get_y' ? promoGetQty : undefined,
      discountPercent: promoType === 'category_discount' ? promoDiscount : undefined,
      categoryId: promoType === 'category_discount' ? promoCategory : undefined,
      isActive: true
    };

    const allPromos = [...promotions, newPromo];
    GaiadentStorage.setPromotions(allPromos);
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Crear Promoción', `Se creó la promoción: ${promoName}`);
    setIsPromoModalOpen(false);
    setPromoName('');
    setPromoDesc('');
    loadData();
    alert('Nueva promoción odontológica registrada con éxito.');
  };

  // Order Logistics & CONSOLIDATION
  const handleConsolidateOrders = () => {
    // Gather all individual clinic orders with 'Recibido' state
    const pendingOrders = orders.filter(o => o.status === OrderStatus.RECIBIDO);

    if (pendingOrders.length === 0) {
      alert('No hay pedidos nuevos recibidos en Oruro para consolidar el día de hoy.');
      return;
    }

    // Consolidate quantities required per product
    const productQuantities: Record<string, { name: string; brand: string; qty: number }> = {};
    
    pendingOrders.forEach(ord => {
      ord.items.forEach(item => {
        if (!productQuantities[item.productId]) {
          productQuantities[item.productId] = {
            name: item.productName,
            brand: item.brand,
            qty: 0
          };
        }
        productQuantities[item.productId].qty += item.quantity;
      });
    });

    const masterItems = Object.keys(productQuantities).map(pId => ({
      productId: pId,
      productName: productQuantities[pId].name,
      brand: productQuantities[pId].brand,
      totalRequested: productQuantities[pId].qty,
      status: 'pending' as const
    }));

    const masterId = `M-OR-${new Date().toISOString().slice(0, 10)}`;
    const newMaster: MasterOrder = {
      id: masterId,
      createdAt: new Date().toISOString(),
      status: 'Creado',
      originCity: 'Santa Cruz',
      destinationCity: 'Oruro',
      items: masterItems,
      orderIdsConsolidated: pendingOrders.map(o => o.id)
    };

    // Transition individual orders to 'CONSOLIDADO'
    const updatedOrders = orders.map(o => {
      if (pendingOrders.find(po => po.id === o.id)) {
        return {
          ...o,
          status: OrderStatus.CONSOLIDADO,
          masterOrderId: masterId,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    const allMasters = GaiadentStorage.getMasterOrders();
    allMasters.unshift(newMaster);
    GaiadentStorage.setMasterOrders(allMasters);
    GaiadentStorage.setOrders(updatedOrders);

    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Consolidación Diaria',
      `Consolidó ${pendingOrders.length} pedidos. Generó Pedido Maestro ${masterId} para proveedor de Santa Cruz.`
    );

    loadData();
    alert(`¡Consolidación Exitosa! Se ha generado el Pedido Maestro ${masterId} con ${masterItems.length} insumos consolidados.`);
  };

  const handleRequestToSantaCruz = (masterId: string) => {
    const updatedMasters = masterOrders.map(m => {
      if (m.id === masterId) {
        return { ...m, status: 'Solicitado' as const };
      }
      return m;
    });

    // Update individual orders to "SOLICITADO_PROVEEDOR"
    const targetMaster = masterOrders.find(m => m.id === masterId)!;
    const updatedOrders = orders.map(o => {
      if (targetMaster.orderIdsConsolidated.includes(o.id)) {
        return { ...o, status: OrderStatus.SOLICITADO_PROVEEDOR, updatedAt: new Date().toISOString() };
      }
      return o;
    });

    GaiadentStorage.setMasterOrders(updatedMasters);
    GaiadentStorage.setOrders(updatedOrders);
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Solicitar Proveedor', `Se envió la orden de Pedido Maestro ${masterId} al proveedor en Santa Cruz.`);
    loadData();
    alert('Pedido Maestro enviado al proveedor mayorista de Santa Cruz. Se ha iniciado el tránsito a Oruro (Tiempo de espera: 48-72 hrs).');
  };

  const handleMarkInTransit = (masterId: string) => {
    const updatedMasters = masterOrders.map(m => {
      if (m.id === masterId) return { ...m, status: 'Solicitado' as const };
      return m;
    });

    const targetMaster = masterOrders.find(m => m.id === masterId)!;
    const updatedOrders = orders.map(o => {
      if (targetMaster.orderIdsConsolidated.includes(o.id)) {
        return { ...o, status: OrderStatus.EN_TRANSITO, updatedAt: new Date().toISOString() };
      }
      return o;
    });

    GaiadentStorage.setMasterOrders(updatedMasters);
    GaiadentStorage.setOrders(updatedOrders);
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Despachar En Tránsito', `Mercadería del Pedido Maestro ${masterId} despachada y en tránsito hacia Oruro.`);
    loadData();
    alert('Los insumos se encuentran en tránsito en la carretera SC-OR.');
  };

  // Open Warehouse Verification Modal
  const handleOpenMasterVerify = (master: MasterOrder) => {
    setVerifyingMaster(master);
    const initialRecs: Record<string, number> = {};
    master.items.forEach(item => {
      initialRecs[item.productId] = item.totalRequested; // Default to full reception
    });
    setTempReceivedQuantities(initialRecs);
    setIsMasterVerifyOpen(true);
  };

  const handleRegisterReception = () => {
    if (!verifyingMaster) return;

    // Determine if it was total or partial reception
    const itemsWithRecs = verifyingMaster.items.map(item => {
      const received = tempReceivedQuantities[item.productId] || 0;
      const isFull = received >= item.totalRequested;
      return {
        ...item,
        totalReceived: received,
        status: (received === 0 ? 'pending' : isFull ? 'received_full' : 'received_partial') as any
      };
    });

    const updatedMasters = masterOrders.map(m => {
      if (m.id === verifyingMaster.id) {
        return {
          ...m,
          status: 'Recibido' as const,
          items: itemsWithRecs
        };
      }
      return m;
    });

    // Update individual orders to "RECIBIDO_ALMACEN"
    const updatedOrders = orders.map(o => {
      if (verifyingMaster.orderIdsConsolidated.includes(o.id)) {
        // Feed matching item received quantity to order items
        const updatedItems = o.items.map(oItem => {
          const masterItem = itemsWithRecs.find(mItem => mItem.productId === oItem.productId);
          const receivedRatio = masterItem && masterItem.totalRequested > 0 
            ? (masterItem.totalReceived || 0) / masterItem.totalRequested
            : 1;
          const individualReceivedQty = Math.floor(oItem.quantity * receivedRatio);
          return {
            ...oItem,
            receivedQuantity: individualReceivedQty
          };
        });

        return {
          ...o,
          items: updatedItems,
          status: OrderStatus.RECIBIDO_ALMACEN,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    GaiadentStorage.setMasterOrders(updatedMasters);
    GaiadentStorage.setOrders(updatedOrders);
    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Recepción Almacén',
      `Verificó arribo del Pedido Maestro ${verifyingMaster.id}. Registró recepción de mercadería.`
    );

    setIsMasterVerifyOpen(false);
    setVerifyingMaster(null);
    loadData();
    alert('Mercadería del Pedido Maestro recibida en almacén de Oruro. Los productos se han distribuido automáticamente entre los pedidos de clínicas odontológicas.');
  };

  // Auto-Distribution to Delivery preparation
  const handleStartPreparation = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: OrderStatus.EN_PREPARACION, updatedAt: new Date().toISOString() };
      }
      return o;
    });
    GaiadentStorage.setOrders(updated);
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Preparar Pedido', `Pedido ${orderId} en preparación (personal empaquetando insumos).`);
    loadData();
  };

  // Open Rider Assignment Modal
  const handleOpenRiderAssignment = (order: Order) => {
    setAssigningOrder(order);
    const riders = users.filter(u => u.role === UserRole.DELIVERY);
    if (riders.length > 0) {
      setSelectedRiderId(riders[0].id);
    }
    setIsRiderModalOpen(true);
  };

  const handleAssignRider = () => {
    if (!assigningOrder || !selectedRiderId) return;

    const riderUser = users.find(u => u.id === selectedRiderId)!;

    const updated = orders.map(o => {
      if (o.id === assigningOrder.id) {
        return {
          ...o,
          status: OrderStatus.EN_RUTA,
          deliveryRiderId: riderUser.id,
          deliveryRiderName: riderUser.name,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    GaiadentStorage.setOrders(updated);
    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Asignar Repartidor',
      `Asignó el pedido ${assigningOrder.id} al repartidor ${riderUser.name} para entrega en Oruro.`
    );

    setIsRiderModalOpen(false);
    setAssigningOrder(null);
    loadData();
    alert(`Pedido ${assigningOrder.id} asignado al repartidor ${riderUser.name}. Estado actualizado a "En ruta".`);
  };

  // Simulated Report Exports (PDF / Excel)
  const handleExportReport = (type: 'pdf' | 'excel') => {
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Exportar Reporte', `Exportó reporte consolidado de gestión en formato ${type.toUpperCase()}`);
    alert(`Reporte consolidado de ventas y distribución Gaiädent Oruro exportado con éxito en formato ${type.toUpperCase()}.\nDescarga completada en su dispositivo.`);
  };

  // Charts Mock Data preparation
  const salesByDateData = [
    { name: '25 Jun', ventas: 875, pedidos: 1 },
    { name: '26 Jun', ventas: 1265, pedidos: 2 },
    { name: '27 Jun', ventas: 390, pedidos: 1 },
    { name: '28 Jun', ventas: 185, pedidos: 1 },
    { name: '29 Jun', ventas: 0, pedidos: 0 },
    { name: '30 Jun', ventas: 1730, pedidos: 2 }
  ];

  const categoryShareData = [
    { name: 'Restauradora', valor: 1380 },
    { name: 'Endodoncia', valor: 390 },
    { name: 'Ortodoncia', valor: 600 },
    { name: 'Implantología', valor: 890 },
    { name: 'Bioseguridad', valor: 240 }
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-dashboard" className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm shadow-emerald-50 border-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pedidos Nuevos</span>
            <span className="font-extrabold text-xl text-slate-800">
              {orders.filter(o => o.status === OrderStatus.RECIBIDO).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm shadow-blue-50 border-0">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pedido Maestro</span>
            <span className="font-extrabold text-xl text-slate-800">
              {masterOrders.filter(m => m.status !== 'Distribuido').length} Activo
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm shadow-amber-50 border-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">En Reparto</span>
            <span className="font-extrabold text-xl text-slate-800">
              {orders.filter(o => o.status === OrderStatus.EN_RUTA).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 shrink-0 shadow-sm shadow-slate-100 border-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Consolidado Total</span>
            <span className="font-extrabold text-sm text-slate-800">
              BOB {orders.filter(o => o.status !== OrderStatus.CANCELADO).reduce((sum, o) => sum + o.total, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto border-b border-slate-200 mb-6 gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Gestión de Pedidos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'master' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Consolidación Maestro ({masterOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'catalog' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" /> Catálogo de Insumos
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'clients' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> Clínicas y Clientes
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'promotions' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" /> Promociones Activas
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Reportes Logísticos
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg shrink-0 flex items-center gap-1.5 ${
            activeTab === 'map' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Map className="w-4 h-4" /> Mapa de Clínicas Oruro
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide">Pedidos de Clínicas en Bolivia</h3>
              <button
                onClick={handleConsolidateOrders}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-amber-300" /> Consolidar Pedidos Diarios
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Doctor, clínica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-emerald-100 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-emerald-100 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="">Todos los Estados</option>
                {Object.values(OrderStatus).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-50/50 text-emerald-950 font-bold border-b border-gray-100">
                  <th className="p-3">Código</th>
                  <th className="p-3">Doctor / Clínica</th>
                  <th className="p-3">Insumos</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Estado Logístico</th>
                  <th className="p-3 text-center">Acciones Logísticas</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(ord => {
                  const itemsList = ord.items.map(i => `${i.productName} (x${i.quantity})`).join(', ');
                  return (
                    <tr key={ord.id} className="border-b border-gray-50 hover:bg-emerald-50/20 transition-all">
                      <td className="p-3 font-bold text-emerald-950">{ord.id}</td>
                      <td className="p-3">
                        <span className="font-semibold block text-emerald-900">{ord.clientName}</span>
                        <span className="text-[10px] text-gray-400">{ord.clinicName} • {ord.phone}</span>
                      </td>
                      <td className="p-3 max-w-xs truncate" title={itemsList}>{itemsList}</td>
                      <td className="p-3 font-bold text-emerald-950">BOB {ord.total}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1.5">
                        {ord.status === OrderStatus.RECIBIDO_ALMACEN && (
                          <button
                            onClick={() => handleStartPreparation(ord.id)}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold px-2 py-1 rounded-xl text-[10px] transition-all"
                          >
                            Preparar Pedido
                          </button>
                        )}
                        {ord.status === OrderStatus.EN_PREPARACION && (
                          <button
                            onClick={() => handleOpenRiderAssignment(ord)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-xl text-[10px] transition-all flex items-center gap-1 mx-auto"
                          >
                            <Truck className="w-3.5 h-3.5" /> Asignar Repartidor
                          </button>
                        )}
                        {ord.status === OrderStatus.EN_RUTA && (
                          <span className="text-[10px] text-indigo-700 font-bold flex items-center justify-center gap-1">
                            🏍️ {ord.deliveryRiderName?.split(' ')[0]}
                          </span>
                        )}
                        {ord.status === OrderStatus.ENTREGADO && (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                            ✓ Entregado conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'master' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-emerald-600" /> Pedidos Maestros Consolidados
            </h3>
            <span className="text-[10px] text-gray-500 font-medium">Origen: Santa Cruz (Sede Proveedores) → Destino: Almacén Oruro</span>
          </div>

          {masterOrders.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl block mb-2">📦</span>
              <p className="text-xs text-gray-400 font-semibold">No se ha generado ningún Pedido Maestro hoy.</p>
              <button
                onClick={() => setActiveTab('orders')}
                className="mt-3 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700"
              >
                Ver Pedidos Clínicas para Consolidar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {masterOrders.map(mo => (
                <div key={mo.id} className="border border-emerald-50 rounded-2xl p-4 bg-emerald-50/10 hover:bg-white transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-3 mb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-950">Pedido Maestro: {mo.id}</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          {mo.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        Creado: {new Date(mo.createdAt).toLocaleDateString()} • Consolida {mo.orderIdsConsolidated.length} órdenes clínicas.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {mo.status === 'Creado' && (
                        <button
                          onClick={() => handleRequestToSantaCruz(mo.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Solicitar al Proveedor (Santa Cruz)
                        </button>
                      )}
                      {mo.status === 'Solicitado' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkInTransit(mo.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                          >
                            Colocar En Tránsito
                          </button>
                          <button
                            onClick={() => handleOpenMasterVerify(mo)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                          >
                            Verificar Arribo y Distribución
                          </button>
                        </div>
                      )}
                      {mo.status === 'Recibido' && (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          ✓ Recibido y Distribuido en Oruro
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Master Order Items list */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {mo.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-emerald-50/50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-emerald-950 block">{item.productName}</span>
                          <span className="text-[9px] text-emerald-700 font-medium">{item.brand}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">Consolidado</span>
                          <span className="font-black text-emerald-950 text-sm">
                            {item.totalReceived !== undefined ? `${item.totalReceived} / ` : ''}{item.totalRequested} uds
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide">Catálogo de Insumos Dentales</h3>
            <button
              onClick={() => handleOpenProductModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Insumo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className={`border p-4 rounded-2xl shadow-sm flex flex-col justify-between transition-all ${p.isActive ? 'bg-white border-emerald-50' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.image === 'composite' ? '🦷' : p.image === 'adhesive' ? '🧪' : '📦'}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-emerald-950 line-clamp-1">{p.name}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold block mb-2">{p.brand} • {p.presentation}</span>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-gray-400 block font-bold">PRECIO</span>
                    <span className="font-extrabold text-xs text-emerald-950">BOB {p.price}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenProductModal(p)}
                      className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-100"
                      title="Editar Ficha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleProduct(p.id)}
                      className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-100"
                      title={p.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1 bg-red-50 hover:bg-red-100 text-red-800 rounded border border-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide">Registro Clínico de Odontólogos en Bolivia</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Control y administración directa de cuentas de odontólogos y consultorios del sistema.</p>
            </div>
            <button
              onClick={() => handleOpenDentistModal(null)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Registrar Odontólogo
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Buscar odontólogos por nombre, clínica, celular o dirección..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Dentists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter(u => u.role === UserRole.DENTIST)
              .filter(dent => {
                const query = clientSearch.toLowerCase();
                return dent.name.toLowerCase().includes(query) ||
                       (dent.clinicName && dent.clinicName.toLowerCase().includes(query)) ||
                       (dent.phone && dent.phone.includes(query)) ||
                       (dent.address && dent.address.toLowerCase().includes(query));
              })
              .map(dent => (
                <div key={dent.id} className="border border-slate-200 hover:border-emerald-200 bg-white hover:shadow-xs p-5 rounded-3xl flex flex-col justify-between transition-all">
                  <div>
                    {/* Header: Role and Active status */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        Odontólogo
                      </span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${dent.isActive ? 'bg-emerald-600/10 text-emerald-800' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {dent.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      🩺 {dent.name}
                    </h4>
                    
                    {dent.clinicName && (
                      <p className="text-xs font-bold text-emerald-800 mt-1">
                        🏢 {dent.clinicName}
                      </p>
                    )}

                    <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 leading-tight">
                      {dent.address && (
                        <p className="flex items-start gap-1.5 bg-slate-50 p-2 rounded-xl text-slate-500 border border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{dent.address}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5 pt-1"><span className="text-slate-400">📞</span> <strong className="font-semibold text-slate-600">Celular:</strong> {dent.phone}</p>
                      <p className="flex items-center gap-1.5"><span className="text-slate-400">✉</span> <strong className="font-semibold text-slate-600">Email:</strong> {dent.email}</p>
                      <p className="flex items-center gap-1.5"><span className="text-slate-400">📍</span> <strong className="font-semibold text-slate-600">Región:</strong> {dent.city || 'Oruro'} ({dent.regionId || 'reg-oruro'})</p>
                      
                      {dent.pinCode && (
                        <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100/50 rounded-lg px-2 py-0.5 inline-block mt-2">
                          🔑 PIN: {dent.pinCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDentistModal(dent)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-100 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar Cuenta
                    </button>
                    
                    <button
                      onClick={() => {
                        const updated = users.map(u => u.id === dent.id ? { ...u, isActive: !u.isActive } : u);
                        GaiadentStorage.setUsers(updated);
                        setUsers(updated);
                        alert(`Estado del odontólogo ${dent.name} actualizado.`);
                      }}
                      className={`px-3 py-2 rounded-xl font-bold text-xs border transition-all ${
                        dent.isActive 
                          ? 'bg-red-50 hover:bg-red-100/80 text-red-700 border-red-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title={dent.isActive ? 'Dar de Baja Temporal' : 'Activar Cuenta'}
                    >
                      {dent.isActive ? 'Baja' : 'Alta'}
                    </button>

                    <button
                      onClick={() => handleDeleteDentist(dent.id, dent.name)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-100 text-slate-400 hover:text-red-600 transition-all"
                      title="Eliminar Cuenta Permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {users.filter(u => u.role === UserRole.DENTIST).filter(dent => {
              const query = clientSearch.toLowerCase();
              return dent.name.toLowerCase().includes(query) ||
                     (dent.clinicName && dent.clinicName.toLowerCase().includes(query)) ||
                     (dent.phone && dent.phone.includes(query)) ||
                     (dent.address && dent.address.toLowerCase().includes(query));
            }).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-xs">No se encontraron odontólogos con ese criterio de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide">Promociones para Clínicas Odontológicas</h3>
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              Registrar Promoción Especial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-gradient-to-br from-emerald-50/50 to-teal-50 border border-emerald-100 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-2">
                    {promo.type === 'buy_x_get_y' ? `Paga ${promo.buyQty} Lleva ${promo.buyQty! + promo.getQty!}` : promo.type === 'category_discount' ? `${promo.discountPercent}% OFF` : 'Regalo de Bienvenida'}
                  </span>
                  <h4 className="font-bold text-xs text-emerald-950 block">{promo.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{promo.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100/30 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span>Cobertura Oruro</span>
                  <span className="text-emerald-700">✓ Activa en Portal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-emerald-600" /> Inteligencia Comercial y Reportes Consolidados
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportReport('pdf')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sales Volume area chart */}
            <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-xs text-emerald-950 mb-3">Volumen de Compras Clínicas (Semanas)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByDateData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10}/>
                    <YAxis stroke="#94a3b8" fontSize={10}/>
                    <Tooltip />
                    <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category split bar chart */}
            <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-xs text-emerald-950 mb-3">Distribución de Pedidos por Categoría (BOB)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryShareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9}/>
                    <YAxis stroke="#94a3b8" fontSize={10}/>
                    <Tooltip />
                    <Bar dataKey="valor" fill="#047857" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
              <Map className="w-5 h-5 text-emerald-600" /> Mapa de Clínicas Odontológicas (Oruro, Bolivia)
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
              Zonas de Cobertura: Zona Central, San José, Altiplano
            </span>
          </div>

          <div className="w-full h-96 rounded-3xl bg-emerald-50/30 border border-emerald-100 relative overflow-hidden flex items-center justify-center">
            {/* Interactive map layout mock representing Oruro streets with OpenStreetMap indicators */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Oruro street mock grids */}
            <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none">
              <div className="w-full border-t border-emerald-200/40"></div>
              <div className="w-full border-t border-emerald-200/40"></div>
              <div className="w-full border-t border-emerald-200/40"></div>
            </div>
            <div className="absolute inset-0 flex justify-between p-12 pointer-events-none">
              <div className="h-full border-l border-emerald-200/40"></div>
              <div className="h-full border-l border-emerald-200/40"></div>
              <div className="h-full border-l border-emerald-200/40"></div>
            </div>

            {/* Simulated Clinics Map Pins */}
            {users.filter(u => u.role === UserRole.DENTIST && u.gpsCoordinates).map((dent, index) => (
              <div
                key={dent.id}
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{
                  top: `${40 + index * 18}%`,
                  left: `${25 + index * 22}%`
                }}
              >
                <div className="bg-emerald-600 text-white rounded-full p-2 shadow-md group-hover:bg-emerald-700 transition-all border border-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="mt-1 bg-white border border-emerald-100 rounded-lg px-2 py-1 shadow-sm text-[10px] font-bold text-emerald-950 pointer-events-none whitespace-nowrap">
                  {dent.clinicName}
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white/95 border border-emerald-100 rounded-2xl p-3 shadow-md max-w-xs text-xs">
              <span className="font-extrabold text-emerald-950 block mb-1">Logística de Despachos</span>
              <p className="text-[10px] text-gray-500 leading-normal">
                Al consolidar pedidos, el repartidor visualiza en su Android la ruta de optimización geográfica uniendo los puntos demarcados en verde.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product register/edit modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full border border-emerald-100 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-emerald-950">
                  {editingProduct ? 'Editar Insumo Odontológico' : 'Registrar Nuevo Insumo'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-gray-100 text-gray-500 p-1 rounded-full text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Comercial *</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="Ej: Silicona de Adición"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Marca / Laboratorio *</label>
                    <input
                      type="text"
                      required
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      placeholder="Ej: Coltene"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Categoría *</label>
                    <select
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Presentación Comercial *</label>
                    <input
                      type="text"
                      required
                      value={prodPresent}
                      onChange={(e) => setProdPresent(e.target.value)}
                      placeholder="Ej: Cartucho x 50ml + Puntas"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Precio (BOB) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Stock Inicial *</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Icono Representativo</label>
                    <select
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      className="w-full border border-emerald-100 rounded-xl px-2 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="composite">🦷 Resinas / Estética</option>
                      <option value="adhesive">🧪 Adhesivos / Cementos</option>
                      <option value="files">🧬 Endodoncia / Instrumental</option>
                      <option value="box">📦 Insumo General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Descripción Comercial</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Escriba aquí los detalles..."
                    rows={3}
                    className="w-full border border-emerald-100 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10"
                >
                  Guardar en Catálogo Gaiädent
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotional Register Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-100 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-emerald-950">Crear Promoción Especial</h3>
                <button onClick={() => setIsPromoModalOpen(false)} className="bg-gray-100 text-gray-500 p-1 rounded-full text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleSavePromotion} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Promoción *</label>
                  <input
                    type="text"
                    required
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                    placeholder="Ej: Pack Especial de Fin de Mes"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Tipo de Promoción</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as any)}
                    className="w-full border border-emerald-100 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="buy_x_get_y">Compra X lleva Y de Regalo (Ej: 5+1)</option>
                    <option value="category_discount">Descuento Directo por Categoría</option>
                    <option value="first_purchase_gift">Regalo de Bienvenida por Primera Compra</option>
                  </select>
                </div>

                {promoType === 'buy_x_get_y' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Cantidad Compra</label>
                      <input
                        type="number"
                        value={promoBuyQty}
                        onChange={(e) => setPromoBuyQty(Number(e.target.value))}
                        className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Unidades Gratis</label>
                      <input
                        type="number"
                        value={promoGetQty}
                        onChange={(e) => setPromoGetQty(Number(e.target.value))}
                        className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-center font-bold"
                      />
                    </div>
                  </div>
                )}

                {promoType === 'category_discount' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Descuento (%)</label>
                      <input
                        type="number"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(Number(e.target.value))}
                        className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Categoría Aplicable</label>
                      <select
                        value={promoCategory}
                        onChange={(e) => setPromoCategory(e.target.value)}
                        className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 bg-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Descripción de Promoción *</label>
                  <textarea
                    required
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    placeholder="Describa el beneficio..."
                    rows={2.5}
                    className="w-full border border-emerald-100 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-xs transition-colors shadow-md"
                >
                  Guardar Promoción en Portal
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rider Assignment Modal */}
      <AnimatePresence>
        {isRiderModalOpen && assigningOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-45"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-emerald-100 shadow-2xl"
            >
              <h3 className="font-extrabold text-sm text-emerald-950 mb-2">Despachar Pedido #{assigningOrder.id}</h3>
              <p className="text-xs text-gray-500 mb-4">
                El pedido para <span className="font-semibold text-emerald-900">{assigningOrder.clientName}</span> está embalado y listo. Asigne un chofer/repartidor para entrega en Oruro.
              </p>

              <div className="space-y-3 mb-6">
                <label className="text-[10px] font-bold text-emerald-900 block mb-1">Repartidores Activos</label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-3 py-2 text-xs bg-white"
                >
                  {users.filter(u => u.role === UserRole.DELIVERY).map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.city})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsRiderModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignRider}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-xs transition-colors shadow-md"
                >
                  Asignar y Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dentist Profile Add/Edit Modal */}
      <AnimatePresence>
        {isDentistModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-100 shadow-2xl relative"
            >
              {/* Close button */}
              <button
                onClick={() => setIsDentistModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 hover:bg-slate-100 rounded-full transition-all"
                type="button"
              >
                ✕
              </button>

              <h3 className="font-extrabold text-sm text-emerald-950 mb-4 flex items-center gap-1.5">
                🩺 {editingDentist ? 'Modificar Ficha de Odontólogo' : 'Registrar Nuevo Odontólogo'}
              </h3>

              <form onSubmit={handleSaveDentist} className="space-y-4 text-xs">
                {/* Dentist Name */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    placeholder="Ej: Dr. Fernando Camacho"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Email de Contacto *</label>
                    <input
                      type="email"
                      required
                      value={dentistEmail}
                      onChange={(e) => setDentistEmail(e.target.value)}
                      placeholder="camacho@gaiadent.com"
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Teléfono / Celular *</label>
                    <input
                      type="text"
                      required
                      value={dentistPhone}
                      onChange={(e) => setDentistPhone(e.target.value)}
                      placeholder="+591 7XXXXXXX"
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Clinic Name */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre de la Clínica / Consultorio *</label>
                  <input
                    type="text"
                    required
                    value={dentistClinic}
                    onChange={(e) => setDentistClinic(e.target.value)}
                    placeholder="Ej: Consultorio Dental Camacho & Asociados"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 focus:outline-none text-xs text-slate-800"
                  />
                </div>

                {/* Clinic Address */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Dirección del Consultorio *</label>
                  <input
                    type="text"
                    required
                    value={dentistAddress}
                    onChange={(e) => setDentistAddress(e.target.value)}
                    placeholder="Ej: Av. Villarroel #250 entre 6 de Octubre y Potosí"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 focus:outline-none text-xs text-slate-800"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">PIN de Seguridad (4 dígitos para autenticación rápida)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={dentistPin}
                    onChange={(e) => setDentistPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Opcional. Ej: 5678"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-center font-bold tracking-widest text-xs"
                  />
                </div>

                {/* Active status */}
                {editingDentist && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Habilitado en Sucursal</span>
                      <span className="text-[10px] text-slate-500">¿Permitir pedidos a este cliente?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dentistIsActive} 
                        onChange={(e) => setDentistIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDentistModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow-md shadow-emerald-100 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                  >
                    {editingDentist ? 'Guardar Cambios' : 'Registrar Odontólogo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Verify and Reception Modal */}
      <AnimatePresence>
        {isMasterVerifyOpen && verifyingMaster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-xl w-full border border-emerald-100 shadow-2xl"
            >
              <h3 className="font-extrabold text-sm text-emerald-950 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Registro de Recepción del Pedido Maestro
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-normal">
                Verifique físicamente la cantidad que ha llegado de Santa Cruz al almacén de Oruro. Si hubo faltantes del proveedor, registre la cantidad parcial para que el sistema distribuya equitativamente.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pr-1">
                {verifyingMaster.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 border border-emerald-50 rounded-2xl bg-emerald-50/10 text-xs">
                    <div>
                      <span className="font-bold text-emerald-950 block">{item.productName}</span>
                      <span className="text-[10px] text-emerald-700">{item.brand} • Solicitado: {item.totalRequested} uds</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Recibido:</span>
                      <input
                        type="number"
                        min={0}
                        max={item.totalRequested}
                        value={tempReceivedQuantities[item.productId] !== undefined ? tempReceivedQuantities[item.productId] : item.totalRequested}
                        onChange={(e) => {
                          const val = Math.min(item.totalRequested, Math.max(0, Number(e.target.value)));
                          setTempReceivedQuantities(prev => ({
                            ...prev,
                            [item.productId]: val
                          }));
                        }}
                        className="w-16 border border-emerald-200 rounded-lg px-2 py-1 text-center font-bold text-emerald-950"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setIsMasterVerifyOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterReception}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Registrar Entrada y Distribuir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
