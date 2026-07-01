import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, UserProfile, UserRole } from '../types';
import { GaiadentStorage } from '../utils/storage';
import {
  Truck,
  MapPin,
  CheckCircle,
  Phone,
  Compass,
  PlusCircle,
  Camera,
  Signature,
  FileText,
  AlertTriangle,
  RefreshCw,
  X,
  Play,
  Award
} from 'lucide-react';

interface RiderPanelProps {
  currentUser: UserProfile;
}

export default function RiderPanel({ currentUser }: RiderPanelProps) {
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  
  // Signature pad states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Delivery form states
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Return fields
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Embalaje dañado');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  // New Clinic registration
  const [isRegisteringClinic, setIsRegisteringClinic] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newGps, setNewGps] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = () => {
    const all = GaiadentStorage.getOrders();
    // Filter only my assigned orders with status "En ruta" or "Entregado"
    const myAssigned = all.filter(o => o.deliveryRiderId === currentUser.id);
    setAssignedOrders(myAssigned);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Photo Capture Simulation
  const simulateCameraCapture = () => {
    // Generate a beautiful photo confirmation representing delivered boxes
    const simulatedPhotoBase64 = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23ecfdf5"/><rect x="25" y="35" width="50" height="40" rx="5" fill="%23d1fae5" stroke="%2310b981" stroke-width="2"/><path d="M25 35L50 50L75 35" fill="none" stroke="%2310b981" stroke-width="2"/><circle cx="50" cy="55" r="8" fill="%2310b981"/><path d="M47 55H53M50 52V58" stroke="white" stroke-width="2"/><text x="10" y="20" font-family="sans-serif" font-size="8" fill="%23047857" font-weight="bold">ENTREGA GAIADENT</text></svg>`;
    setDeliveryPhoto(simulatedPhotoBase64);
    setIsCameraActive(false);
    alert('Fotografía de entrega guardada como respaldo digital en Oruro.');
  };

  // Record Arrival
  const handleRegisterArrival = (orderId: string) => {
    alert(`Llegada a clínica registrada. Notificando por SMS al odontólogo del pedido #${orderId}.`);
    GaiadentStorage.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'Registro Llegada', `Repartidor registró llegada física a la clínica del pedido #${orderId}`);
  };

  // Submit Final Delivery Confirmation
  const handleConfirmDelivery = () => {
    if (!selectedOrderForDelivery) return;
    if (!hasSignature) {
      alert('Se requiere capturar la firma digital de conformidad del doctor.');
      return;
    }

    // Convert canvas signature to DataURL
    const sigDataUrl = canvasRef.current?.toDataURL() || '';

    // Transition state
    const allOrders = GaiadentStorage.getOrders();
    const updated = allOrders.map(o => {
      if (o.id === selectedOrderForDelivery.id) {
        return {
          ...o,
          status: OrderStatus.ENTREGADO,
          deliverySignature: o.clientName, // Store client signature representative name
          deliverySignatureImage: sigDataUrl,
          deliveryPhoto: deliveryPhoto || undefined,
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
      'Entregar Pedido',
      `Entregó con éxito el pedido #${selectedOrderForDelivery.id} en la clínica ${selectedOrderForDelivery.clinicName}.`
    );

    setSelectedOrderForDelivery(null);
    setDeliveryPhoto(null);
    setHasSignature(false);
    loadOrders();
    alert('¡Pedido entregado con éxito! Firma y foto guardadas en los servidores de Gaiadent.');
  };

  // Open Partial/Total Returns Modal
  const handleOpenReturns = (order: Order) => {
    setReturningOrder(order);
    const initialQtys: Record<string, number> = {};
    order.items.forEach(it => {
      initialQtys[it.productId] = 0; // Default to 0 returned (meaning full delivery)
    });
    setReturnQuantities(initialQtys);
    setIsReturnModalOpen(true);
  };

  const handleRegisterReturns = () => {
    if (!returningOrder) return;

    // Transition state
    const totalReturnedItems = (Object.values(returnQuantities) as number[]).reduce((sum, q) => sum + q, 0);

    if (totalReturnedItems === 0) {
      alert('Debe marcar por lo menos una unidad para devolución.');
      return;
    }

    const allOrders = GaiadentStorage.getOrders();
    const updated = allOrders.map(o => {
      if (o.id === returningOrder.id) {
        // Compute if it's total or partial return
        const totalOrderedItems = o.items.reduce((sum, it) => sum + it.quantity, 0);
        const isTotal = totalReturnedItems >= totalOrderedItems;

        return {
          ...o,
          status: isTotal ? OrderStatus.CANCELADO : OrderStatus.ENTREGADO_PARCIALMENTE,
          returnReason: `${returnReason}: ${returnDetails}`,
          returnedItems: o.items.map(it => ({
            productId: it.productId,
            quantityReturned: returnQuantities[it.productId] || 0
          })),
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
      'Registro Devolución',
      `Registró devolución ${totalReturnedItems === returningOrder.items.reduce((s: number, i) => s + i.quantity, 0) ? 'TOTAL' : 'PARCIAL'} para pedido #${returningOrder.id}. Motivo: ${returnReason}`
    );

    setIsReturnModalOpen(false);
    setReturningOrder(null);
    loadOrders();
    alert('Devolución registrada correctamente en Oruro. Los insumos devueltos se reintegrarán al stock.');
  };

  // Browser Location API for New Clinic GPS
  const handleRegisterNewClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName || !newDoctorName || !newPhone || !newAddress) {
      alert('Por favor complete todos los datos.');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          saveClinic(coords);
        },
        (err) => {
          console.error(err);
          // Oruro fallback coordinates
          saveClinic({ lat: -17.962 + Math.random() * 0.01, lng: -67.111 + Math.random() * 0.01 });
        }
      );
    } else {
      saveClinic({ lat: -17.9642, lng: -67.1105 });
    }
  };

  const saveClinic = (coords: { lat: number; lng: number }) => {
    const defaultRegion = GaiadentStorage.getRegions().find(r => r.code === 'OR')!;
    const newDentist: UserProfile = {
      id: `usr-dentist-new-${Date.now()}`,
      role: UserRole.DENTIST,
      name: newDoctorName,
      email: `${newDoctorName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      phone: newPhone,
      clinicName: newClinicName,
      address: newAddress,
      city: 'Oruro',
      regionId: defaultRegion.id,
      gpsCoordinates: coords,
      isActive: true
    };

    const allUsers = [...GaiadentStorage.getUsers(), newDentist];
    GaiadentStorage.setUsers(allUsers);

    GaiadentStorage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'Registro Nueva Clínica',
      `Registró nueva clínica ${newClinicName} con coordenadas GPS en Oruro.`
    );

    setIsRegisteringClinic(false);
    setNewClinicName('');
    setNewDoctorName('');
    setNewPhone('');
    setNewAddress('');
    alert(`Clínica ${newClinicName} registrada con éxito. Coordenadas de geolocalización guardadas: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
  };

  return (
    <div id="rider-dashboard" className="max-w-md mx-auto px-4 py-6 space-y-6">
      
      {/* Rider Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15">
          <Truck className="w-40 h-40" />
        </div>
        <span className="text-[9px] bg-emerald-800/60 border border-emerald-500/30 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Repartidor Gaiädent Oruro
        </span>
        <h2 className="text-md font-bold mt-2">Hola, {currentUser.name}</h2>
        <p className="text-[10px] text-emerald-100/90 mt-0.5">Rutas activas en Oruro para consolidaciones diarias.</p>
        
        <button
          onClick={() => setIsRegisteringClinic(true)}
          className="mt-4 w-full bg-white text-emerald-800 font-bold py-2 rounded-lg text-[11px] hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Registrar Nueva Clínica Dental
        </button>
      </div>

      {/* Map View Polyline Route Oruro */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-4 h-4 text-emerald-600" /> Ruta GPS de Despacho Oruro
          </h3>
          <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
            {assignedOrders.filter(o => o.status === OrderStatus.EN_RUTA).length} paradas
          </span>
        </div>

        {/* Interactive map layout mock representing Oruro streets with delivery points */}
        <div className="w-full h-48 rounded-xl bg-slate-50/50 border border-slate-200/50 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          {/* Simulated polyline route path connecting dentist clinics */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 150 L 150 70 L 280 120" fill="none" stroke="#059669" stroke-width="4" stroke-dasharray="6 4" stroke-linecap="round"/>
          </svg>

          {/* Oruro central base anchor */}
          <div className="absolute top-[150px] left-[50px] flex flex-col items-center">
            <div className="bg-emerald-800 text-white p-1 rounded-full shadow border border-white text-xs">🏠</div>
            <span className="text-[8px] bg-emerald-950 text-white font-extrabold px-1 rounded mt-0.5">ALMACÉN</span>
          </div>

          {/* Destination Clinica pins */}
          {assignedOrders.filter(o => o.status === OrderStatus.EN_RUTA).map((ord, idx) => (
            <div
              key={ord.id}
              className="absolute flex flex-col items-center"
              style={{
                top: idx === 0 ? '70px' : '120px',
                left: idx === 0 ? '150px' : '280px'
              }}
            >
              <div className="bg-emerald-600 text-white p-1 rounded-full shadow border border-white animate-bounce">📍</div>
              <span className="text-[8px] bg-white border border-emerald-100 rounded px-1 font-bold text-emerald-950">{ord.clientName.split(' ')[0]}</span>
            </div>
          ))}

          <span className="absolute top-2 right-2 text-[9px] text-gray-400 font-semibold italic">GPS Activo</span>
        </div>
      </div>

      {/* Orders to Deliver */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider px-1">Pedidos Asignados</h3>

        {assignedOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 text-center shadow-sm">
            <span className="text-3xl block mb-1">🏍️</span>
            <p className="text-xs text-gray-400 font-semibold">No tienes ningún despacho asignado en este momento.</p>
          </div>
        ) : (
          assignedOrders.map(ord => (
            <div key={ord.id} className="bg-white p-4 rounded-3xl border border-emerald-50 shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <div>
                  <span className="font-bold text-xs text-emerald-950">Pedido #{ord.id}</span>
                  <span className="text-[9px] block text-gray-400">Generado por consolidador</span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${ord.status === OrderStatus.ENTREGADO ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-orange-50 text-orange-800 border-orange-100'}`}>
                  {ord.status}
                </span>
              </div>

              <div>
                <span className="font-bold text-xs text-emerald-900 block">{ord.clientName}</span>
                <span className="text-[11px] text-gray-500 font-medium block">🏥 {ord.clinicName}</span>
                <span className="text-[11px] text-gray-500 font-semibold block mt-1">📍 Calle: {ord.address}</span>
              </div>

              {/* Items List */}
              <div className="bg-emerald-50/20 p-2 rounded-xl border border-emerald-100/30 text-[11px] text-emerald-950">
                <span className="font-bold text-[9px] text-emerald-800 uppercase block mb-1">Insumos para entregar:</span>
                {ord.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.productName}</span>
                    <span className="font-bold text-emerald-800">x {it.quantity}</span>
                  </div>
                ))}
              </div>

              {ord.status === OrderStatus.EN_RUTA && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleRegisterArrival(ord.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-1.5 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Registrar Llegada
                  </button>
                  <button
                    onClick={() => setSelectedOrderForDelivery(ord)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Confirmar Entrega
                  </button>
                </div>
              )}

              {ord.status === OrderStatus.EN_RUTA && (
                <button
                  onClick={() => handleOpenReturns(ord)}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold py-1 rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Registrar Devolución Parcial/Total
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Draw Conformity Signature Modal */}
      <AnimatePresence>
        {selectedOrderForDelivery && (
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
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1">
                  <Signature className="w-4 h-4 text-emerald-600" /> Firma de Conformidad
                </h3>
                <button onClick={() => setSelectedOrderForDelivery(null)} className="text-gray-400">✕</button>
              </div>

              <p className="text-xs text-gray-500">
                Capture la firma manuscrita del odontólogo(a) <span className="font-semibold text-emerald-900">{selectedOrderForDelivery.clientName}</span> para validar la entrega de insumos.
              </p>

              {/* HTML5 Canvas Signature Pad */}
              <div className="border border-emerald-100 rounded-2xl bg-emerald-50/10 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={310}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full block bg-white"
                />
                <button
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold px-2 py-1 rounded-lg text-[9px] transition-all"
                >
                  Limpiar Firma
                </button>
              </div>

              {/* Photo Upload Capture Mock */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-emerald-900 block uppercase">Fotografía de Respaldo Clínico (Oruro)</span>
                
                {deliveryPhoto ? (
                  <div className="relative w-28 h-28 mx-auto border border-emerald-100 rounded-xl overflow-hidden bg-emerald-50">
                    <img src={deliveryPhoto} alt="Entrega" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setDeliveryPhoto(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={simulateCameraCapture}
                    className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Camera className="w-4 h-4" /> Capturar Foto de la Caja Gaiädent
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelivery}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-xs shadow-md"
                >
                  Completar Entrega
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partial Returns Modal */}
      <AnimatePresence>
        {isReturnModalOpen && returningOrder && (
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
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Registrar Devolución
                </h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400">✕</button>
              </div>

              <p className="text-[11px] text-gray-500">
                Seleccione la cantidad de unidades que la clínica de <span className="font-semibold text-emerald-900">{returningOrder.clientName}</span> está devolviendo y especifique el motivo.
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {returningOrder.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center p-2 border border-emerald-50 rounded-xl bg-emerald-50/10">
                    <div>
                      <span className="font-bold text-emerald-950 block text-[11px]">{item.productName}</span>
                      <span className="text-[9px] text-gray-400">Total enviado: {item.quantity} uds</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Devolver:</span>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={returnQuantities[item.productId] || 0}
                        onChange={(e) => {
                          const val = Math.min(item.quantity, Math.max(0, Number(e.target.value)));
                          setReturnQuantities(prev => ({
                            ...prev,
                            [item.productId]: val
                          }));
                        }}
                        className="w-12 border border-emerald-200 rounded-lg px-2 py-0.5 text-center font-bold text-emerald-950"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-900 block mb-1">Motivo de Devolución</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-emerald-100 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="Embalaje dañado">Embalaje dañado</option>
                  <option value="Insumo incorrecto">Insumo incorrecto solicitado</option>
                  <option value="Vencimiento corto">Fecha de vencimiento corta</option>
                  <option value="Otros">Otros (especificar abajo)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-900 block mb-1">Observaciones</label>
                <textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Detalles sobre por qué devuelve el insumo..."
                  rows={2}
                  className="w-full border border-emerald-100 rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterReturns}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 rounded-xl text-xs shadow-md"
                >
                  Registrar Devolución
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Clinic Registration Slide Drawer */}
      <AnimatePresence>
        {isRegisteringClinic && (
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
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1">
                  <PlusCircle className="w-4 h-4 text-emerald-600" /> Registrar Clínica Nueva
                </h3>
                <button onClick={() => setIsRegisteringClinic(false)} className="text-gray-400">✕</button>
              </div>

              <p className="text-xs text-gray-500">
                Formulario de registro rápido en terreno (Oruro). El sistema capturará las coordenadas GPS de su celular al presionar guardar.
              </p>

              <form onSubmit={handleRegisterNewClinic} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre del Consultorio/Clínica *</label>
                  <input
                    type="text"
                    required
                    value={newClinicName}
                    onChange={(e) => setNewClinicName(e.target.value)}
                    placeholder="Ej: Odontología Oruro"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Completo del Odontólogo *</label>
                  <input
                    type="text"
                    required
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    placeholder="Ej: Dr. Roberto Siles"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Teléfono Móvil *</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+591 7XXXXXXX"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Ciudad</label>
                    <input type="text" readOnly value="Oruro" className="w-full bg-gray-100 border border-emerald-100 rounded-xl px-3 py-1.5 text-gray-400 font-bold" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Dirección Exacta de Referencia *</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Av. 6 de Octubre y Cochabamba"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors shadow-md"
                >
                  Registrar Clínica con GPS
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
