import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Order, OrderStatus, UserProfile, Promotion } from '../types';
import { GaiadentStorage } from '../utils/storage';
import {
  Search,
  ShoppingCart,
  History,
  User,
  Package,
  Check,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Shield,
  MapPin,
  FileText
} from 'lucide-react';

interface DentistPanelProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAssistant: () => void;
  cartCount: number;
  onCartUpdated: () => void;
}

export default function DentistPanel({
  currentUser,
  onUpdateUser,
  onOpenAssistant,
  cartCount,
  onCartUpdated
}: DentistPanelProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'profile'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEnhancingProduct, setIsEnhancingProduct] = useState(false);

  // Cart Local Copy for immediate display
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Orders State
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // Profile Settings
  const [profName, setProfName] = useState(currentUser.name);
  const [profClinic, setProfClinic] = useState(currentUser.clinicName || '');
  const [profAddress, setProfAddress] = useState(currentUser.address || '');
  const [profPhone, setProfPhone] = useState(currentUser.phone);
  const [profPin, setProfPin] = useState(currentUser.pinCode || '');
  const [profUsePin, setProfUsePin] = useState(!!currentUser.pinCode);
  const [profBiometrics, setProfBiometrics] = useState(!!currentUser.biometricEnabled);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    setProducts(GaiadentStorage.getProducts().filter(p => p.isActive));
    setCategories(GaiadentStorage.getCategories().filter(c => c.isActive));
    setPromotions(GaiadentStorage.getPromotions().filter(pr => pr.isActive));
    setCart(GaiadentStorage.getCart());
    
    // Load only my orders
    const allOrders = GaiadentStorage.getOrders();
    setMyOrders(allOrders.filter(o => o.clientId === currentUser.id));
  };

  const handleAddToCart = (productId: string) => {
    const currentCart = GaiadentStorage.getCart();
    const existingIndex = currentCart.findIndex(item => item.productId === productId);
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ productId, quantity: 1 });
    }
    
    GaiadentStorage.setCart(currentCart);
    setCart(currentCart);
    onCartUpdated();
  };

  const updateCartQuantity = (productId: string, amount: number) => {
    let currentCart = GaiadentStorage.getCart();
    const itemIdx = currentCart.findIndex(item => item.productId === productId);
    
    if (itemIdx > -1) {
      const newQty = currentCart[itemIdx].quantity + amount;
      if (newQty <= 0) {
        currentCart = currentCart.filter(item => item.productId !== productId);
      } else {
        currentCart[itemIdx].quantity = newQty;
      }
      GaiadentStorage.setCart(currentCart);
      setCart(currentCart);
      onCartUpdated();
    }
  };

  const removeFromCart = (productId: string) => {
    const currentCart = GaiadentStorage.getCart().filter(item => item.productId !== productId);
    GaiadentStorage.setCart(currentCart);
    setCart(currentCart);
    onCartUpdated();
  };

  const handleReorder = (order: Order) => {
    const newCart = order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    GaiadentStorage.setCart(newCart);
    setCart(newCart);
    onCartUpdated();
    setIsCartOpen(true);
    alert('Se han cargado los productos del pedido anterior en el carrito.');
  };

  // Enhance with AI
  const enhanceProductWithAi = async (product: Product) => {
    setIsEnhancingProduct(true);
    try {
      const cat = categories.find(c => c.id === product.categoryId);
      const res = await fetch('/api/products/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand,
          categoryName: cat?.name || 'Odontología',
          presentation: product.presentation
        })
      });

      if (!res.ok) throw new Error('AI request failed');
      const enhancedData = await res.json();

      // Save enhanced product to storage
      const allProducts = GaiadentStorage.getProducts();
      const updatedProducts = allProducts.map(p => {
        if (p.id === product.id) {
          return {
            ...p,
            technicalSpec: enhancedData.technicalSpec,
            useProtocol: enhancedData.useProtocol,
            scientificCitations: enhancedData.scientificCitations,
            isAiGenerated: true
          };
        }
        return p;
      });

      GaiadentStorage.setProducts(updatedProducts);
      setProducts(updatedProducts.filter(p => p.isActive));
      
      // Update local modal view
      setSelectedProduct({
        ...product,
        technicalSpec: enhancedData.technicalSpec,
        useProtocol: enhancedData.useProtocol,
        scientificCitations: enhancedData.scientificCitations,
        isAiGenerated: true
      });

      GaiadentStorage.addAuditLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'IA Enriquecer Ficha',
        `La IA generó protocolo de uso para ${product.name}`
      );

    } catch (error) {
      console.error(error);
      alert('Error al contactar el asistente dental para generar la ficha.');
    } finally {
      setIsEnhancingProduct(false);
    }
  };

  // Submit Order
  const submitOrder = () => {
    if (cart.length === 0) return;

    // Fetch user region
    const currentRegions = GaiadentStorage.getRegions();
    const userRegion = currentRegions.find(r => r.id === currentUser.regionId) || currentRegions[0];

    // Compute prices & promotions
    const items = cart.map(cartItem => {
      const prod = products.find(p => p.id === cartItem.productId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        brand: prod.brand,
        presentation: prod.presentation,
        price: prod.price,
        quantity: cartItem.quantity
      };
    });

    const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const orderNum = `G-${1000 + GaiadentStorage.getOrders().length + 1}`;

    const newOrder: Order = {
      id: orderNum,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clinicName: currentUser.clinicName || 'Clínica Dental',
      address: currentUser.address || 'Dirección Clínica',
      city: currentUser.city,
      phone: currentUser.phone,
      gpsCoordinates: currentUser.gpsCoordinates,
      items,
      total,
      status: OrderStatus.RECIBIDO,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryTimeHours: userRegion.baseDeliveryTimeHours,
      notes: orderNotes
    };

    const allOrders = GaiadentStorage.getOrders();
    allOrders.unshift(newOrder);
    GaiadentStorage.setOrders(allOrders);

    // Clear cart
    GaiadentStorage.setCart([]);
    setCart([]);
    setOrderNotes('');
    setIsCartOpen(false);
    onCartUpdated();
    
    // Refresh my orders
    setMyOrders(allOrders.filter(o => o.clientId === currentUser.id));

    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Envío de Pedido',
      `Se creó el pedido número ${orderNum} por un total de BOB ${total}`
    );

    alert(`¡Pedido ${orderNum} enviado exitosamente! El administrador lo consolidará pronto. Tiempo estimado de entrega: ${userRegion.baseDeliveryTimeHours} horas.`);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      name: profName,
      clinicName: profClinic,
      address: profAddress,
      phone: profPhone,
      pinCode: profUsePin ? profPin || '0000' : undefined,
      biometricEnabled: profBiometrics
    };

    const allUsers = GaiadentStorage.getUsers().map(u => u.id === currentUser.id ? updatedUser : u);
    GaiadentStorage.setUsers(allUsers);
    GaiadentStorage.setCurrentUser(updatedUser);
    onUpdateUser(updatedUser);

    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Actualización Perfil',
      'El odontólogo actualizó su información y configuración de seguridad.'
    );

    alert('Perfil actualizado con éxito.');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="dentist-dashboard" className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Dynamic Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 shadow-lg shadow-emerald-100/50 shrink-0 border-0">
            <span className="text-2xl">🩺</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">Bienvenido(a), {currentUser.name}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser.clinicName} • {currentUser.address} • Región: <span className="text-emerald-700 bg-emerald-50 border border-emerald-100/60 rounded-full px-2.5 py-0.5 text-[10px] font-bold">Oruro (Consolidación)</span>
            </p>
          </div>
        </div>

        {/* AI Assistant Promotional Card */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-100 cursor-pointer z-10 shrink-0 text-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>Preguntar a Gäyita IA</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" /> Catálogo de Insumos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-1.5 relative ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" /> Mis Pedidos e Historial
          {myOrders.length > 0 && (
            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 animate-pulse">
              {myOrders.filter(o => o.status !== OrderStatus.ENTREGADO && o.status !== OrderStatus.CANCELADO).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" /> Perfil y Seguridad PIN
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Filters Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Buscar Insumos</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: Resina, Limas, 3M..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categorías</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategoryId('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategoryId === ''
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                      selectedCategoryId === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Promotions Banner */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-4 rounded-3xl shadow-md border border-emerald-700/50">
              <span className="text-[9px] bg-amber-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">Promoción Vigente</span>
              <h4 className="font-bold text-xs">{promotions[0]?.name || 'Envío Consolidado Oruro'}</h4>
              <p className="text-[10px] text-emerald-100 mt-1 leading-relaxed">
                {promotions[0]?.description || 'Los pedidos diarios son consolidados de manera colectiva y solicitados a Santa Cruz. Obtén precios de mayorista sin pagar fletes costosos.'}
              </p>
            </div>
          </div>

          {/* Products Column */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 font-medium">
                Mostrando <span className="text-emerald-950 font-bold">{filteredProducts.length}</span> insumos odontológicos
              </p>
              
              {/* Floating Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ver Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProducts.map(prod => {
                const cartQty = cart.find(i => i.productId === prod.id)?.quantity || 0;
                return (
                  <motion.div
                    key={prod.id}
                    layout
                    className="bg-white rounded-3xl p-4 border border-emerald-50 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group"
                  >
                    <div onClick={() => setSelectedProduct(prod)} className="cursor-pointer">
                      {/* Product mock image representation */}
                      <div className="w-full h-32 bg-emerald-50/50 rounded-2xl overflow-hidden mb-3 relative flex items-center justify-center">
                        <span className="text-4xl text-emerald-700/60 transition-transform group-hover:scale-110">
                          {prod.image === 'composite' ? '🦷' : prod.image === 'adhesive' ? '🧪' : prod.image === 'files' ? '🧬' : '📦'}
                        </span>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-emerald-100/80 text-emerald-800 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {prod.brand}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-emerald-950 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">
                        {prod.presentation}
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold block">PRECIO REGISTRADO</span>
                        <span className="font-extrabold text-sm text-emerald-950">BOB {prod.price}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {cartQty > 0 ? (
                          <div className="flex items-center bg-emerald-50 rounded-xl border border-emerald-100 p-0.5">
                            <button
                              onClick={() => updateCartQuantity(prod.id, -1)}
                              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-emerald-950">{cartQty}</span>
                            <button
                              onClick={() => updateCartQuantity(prod.id, 1)}
                              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`add-to-cart-${prod.id}`}
                            onClick={() => handleAddToCart(prod.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <h2 className="text-md font-bold text-emerald-950 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" /> Historial de Compras Clínicas
          </h2>

          {myOrders.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl block mb-2">📦</span>
              <p className="text-xs text-gray-400 font-semibold">Aún no has enviado ningún pedido en la plataforma.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-3 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-colors"
              >
                Ver Catálogo de Insumos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map(ord => {
                const badgeColors: Record<OrderStatus, string> = {
                  [OrderStatus.RECIBIDO]: 'bg-gray-100 text-gray-700 border-gray-200',
                  [OrderStatus.CONSOLIDADO]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                  [OrderStatus.SOLICITADO_PROVEEDOR]: 'bg-amber-50 text-amber-700 border-amber-100',
                  [OrderStatus.EN_TRANSITO]: 'bg-blue-50 text-blue-700 border-blue-100',
                  [OrderStatus.RECIBIDO_ALMACEN]: 'bg-teal-50 text-teal-700 border-teal-100',
                  [OrderStatus.EN_PREPARACION]: 'bg-purple-50 text-purple-700 border-purple-100',
                  [OrderStatus.EN_RUTA]: 'bg-orange-50 text-orange-700 border-orange-100',
                  [OrderStatus.ENTREGADO]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  [OrderStatus.ENTREGADO_PARCIALMENTE]: 'bg-amber-50 text-amber-800 border-amber-200',
                  [OrderStatus.CANCELADO]: 'bg-red-50 text-red-700 border-red-100',
                };

                return (
                  <div key={ord.id} className="border border-emerald-50 rounded-2xl p-4 bg-emerald-50/10 hover:bg-white transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100/50 pb-3 mb-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-emerald-950">Pedido #{ord.id}</span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColors[ord.status]}`}>
                            {ord.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Enviado: {new Date(ord.createdAt).toLocaleDateString()} a las {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Volver a Pedir Trigger */}
                        <button
                          onClick={() => handleReorder(ord)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Volver a Pedir
                        </button>
                      </div>
                    </div>

                    {/* Order items summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h4 className="font-bold text-[10px] text-emerald-800 uppercase mb-1">Insumos Solicitados</h4>
                        <div className="space-y-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white px-2 py-1 rounded-md border border-emerald-50/30">
                              <span className="font-semibold text-emerald-950">
                                {item.productName} <span className="text-gray-400 font-normal">x {item.quantity}</span>
                              </span>
                              <span className="font-bold text-gray-600">BOB {item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h4 className="font-bold text-[10px] text-emerald-800 uppercase mb-0.5">Detalles de Entrega</h4>
                          <p className="text-[11px] text-emerald-950 font-medium leading-tight">
                            Dirección: {ord.address} • Teléfono: {ord.phone}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                            Tiempo estimado de entrega: {ord.deliveryTimeHours} horas (Logística Oruro-Santa Cruz)
                          </p>
                        </div>

                        {ord.deliveryRiderName && (
                          <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30">
                            <span className="font-bold text-[9px] text-emerald-800 block uppercase">Repartidor Asignado</span>
                            <span className="text-[10px] text-emerald-950 font-medium">{ord.deliveryRiderName}</span>
                          </div>
                        )}

                        {ord.notes && (
                          <div>
                            <span className="font-bold text-[9px] text-emerald-800 block uppercase">Notas de Envío</span>
                            <p className="text-[10px] text-gray-500 italic">"{ord.notes}"</p>
                          </div>
                        )}

                        {ord.deliverySignature && (
                          <div className="flex items-center gap-2 bg-emerald-50 p-1.5 rounded-lg text-[10px] font-bold text-emerald-800">
                            <span>✅ Entregado a: {ord.deliverySignature}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100/50 pt-3 mt-3">
                      <span className="text-[10px] text-gray-400 font-semibold">SUCURSAL SANTA CRUZ → ALMACÉN ORURO</span>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold block">TOTAL PEDIDO</span>
                        <span className="font-black text-sm text-emerald-950">BOB {ord.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-md font-bold text-emerald-950 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Configuración de Cuenta Odontológica
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">Nombre del Doctor(a)</label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">Nombre de la Clínica</label>
                <input
                  type="text"
                  required
                  value={profClinic}
                  onChange={(e) => setProfClinic(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">Dirección Clínica de Entrega</label>
                <input
                  type="text"
                  required
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Security Settings Section */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-600" /> Seguridad y Control de Acceso
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50">
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">Activar PIN de Seguridad</span>
                    <span className="text-[10px] text-gray-500">Solicitar PIN de 4 dígitos antes de ingresar al portal.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profUsePin}
                    onChange={(e) => {
                      setProfUsePin(e.target.checked);
                      if (e.target.checked && !profPin) setProfPin('1234');
                    }}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                </div>

                {profUsePin && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 max-w-xs">
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">PIN de Seguridad (4 dígitos)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={profPin}
                      onChange={(e) => setProfPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-emerald-100 rounded-lg px-3 py-1 text-center font-bold tracking-widest text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50">
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">Autenticación Biométrica (Simulado)</span>
                    <span className="text-[10px] text-gray-500">Permitir ingreso mediante huella digital o FaceID en Android.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profBiometrics}
                    onChange={(e) => setProfBiometrics(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Guardar Cambios de Perfil
            </button>
          </form>
        </div>
      )}

      {/* Floating Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-emerald-100 shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {categories.find(c => c.id === selectedProduct.categoryId)?.name}
                  </span>
                  <h3 className="text-md font-extrabold text-emerald-950 mt-1">{selectedProduct.name}</h3>
                  <span className="text-xs text-emerald-700 font-bold">{selectedProduct.brand} • {selectedProduct.presentation}</span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-full transition-colors font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Specs & Protocols Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <h4 className="font-bold text-[10px] text-emerald-800 uppercase mb-2 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Ficha Técnica
                  </h4>
                  <p className="text-[11px] text-emerald-950 leading-relaxed whitespace-pre-line">
                    {selectedProduct.technicalSpec || 'Ficha técnica estándar. Solicite enriquecimiento por IA para mayor detalle clínico.'}
                  </p>
                </div>

                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[10px] text-emerald-800 uppercase mb-2 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Protocolo de Uso Clínico
                    </h4>
                    <p className="text-[11px] text-emerald-950 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                      {selectedProduct.useProtocol || 'No hay un protocolo guardado para este insumo.'}
                    </p>
                  </div>

                  {/* Scientific Citations */}
                  {selectedProduct.scientificCitations && selectedProduct.scientificCitations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-emerald-100/30">
                      <span className="font-bold text-[9px] text-emerald-800 uppercase block mb-1">Sustento Clínico</span>
                      <ul className="list-disc pl-4 space-y-1 text-[9px] text-emerald-950 italic">
                        {selectedProduct.scientificCitations.map((cite, index) => (
                          <li key={index}>{cite}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Enrichment Options */}
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block text-[11px]">Asistente Dental de IA Gaiädent</span>
                    <span className="text-[10px] text-gray-500">
                      {selectedProduct.isAiGenerated
                        ? 'Esta ficha técnica y el protocolo fueron optimizados por nuestra IA comercial.'
                        : '¿Quieres que la IA investigue papers científicos y genere el protocolo de uso óptimo?'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => enhanceProductWithAi(selectedProduct)}
                  disabled={isEnhancingProduct}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-colors flex items-center gap-1"
                >
                  {isEnhancingProduct ? 'Generando...' : selectedProduct.isAiGenerated ? 'Regenerar Ficha' : 'Generar con IA'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-md font-black text-emerald-950">BOB {selectedProduct.price}</span>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Añadir al Carrito
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar / Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs flex justify-end z-40"
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-md font-bold text-emerald-950 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> Carrito de Compras
                  </h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-3xl block mb-2">🛒</span>
                    <p className="text-xs text-gray-400 font-semibold">Tu carrito está vacío.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => {
                      const prod = products.find(p => p.id === item.productId);
                      if (!prod) return null;
                      return (
                        <div key={item.productId} className="flex justify-between items-center p-3 border border-emerald-50 rounded-2xl bg-emerald-50/10">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-xs text-emerald-950 block truncate">{prod.name}</span>
                            <span className="text-[10px] text-gray-400 block">{prod.brand} • BOB {prod.price}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white rounded-lg border border-emerald-100 p-0.5">
                              <button
                                onClick={() => updateCartQuantity(prod.id, -1)}
                                className="p-1 hover:bg-emerald-100 rounded text-emerald-800"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-emerald-950">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(prod.id, 1)}
                                className="p-1 hover:bg-emerald-100 rounded text-emerald-800"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(prod.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-4">
                      <label className="text-[11px] font-bold text-emerald-900 block mb-1">Instrucciones / Notas de Envío</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Ej: Entregar en horario de la tarde, o llamar al llegar..."
                        rows={2}
                        className="w-full border border-emerald-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600 bg-emerald-50/10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="font-bold text-gray-500">Estimación de Entrega:</span>
                    <span className="font-bold text-emerald-800">48 - 72 Horas</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-emerald-950 text-xs">Monto Total Consolidador:</span>
                    <span className="font-extrabold text-md text-emerald-950">
                      BOB {cart.reduce((sum, item) => {
                        const prod = products.find(p => p.id === item.productId);
                        return sum + (prod ? prod.price * item.quantity : 0);
                      }, 0)}
                    </span>
                  </div>

                  <button
                    onClick={submitOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    Confirmar Pedido Colectivo <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[9px] text-gray-400 text-center mt-2 font-medium">
                    * Al presionar confirmar, tu pedido se agrupa automáticamente con la consolidación diaria para solicitud a proveedores en Santa Cruz. No se procesa ningún pago ni facturación aquí.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
