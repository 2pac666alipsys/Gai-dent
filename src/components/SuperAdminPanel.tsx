import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Region, UserProfile, UserRole } from '../types';
import { GaiadentStorage } from '../utils/storage';
import {
  Globe,
  Users,
  Sliders,
  TrendingUp,
  Map,
  Plus,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Award
} from 'lucide-react';

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState<'regions' | 'admins' | 'settings' | 'audit'>('regions');
  const [regions, setRegions] = useState<Region[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Forms states
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regHours, setRegHours] = useState(48);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminRole, setAdminRole] = useState<UserRole>(UserRole.ADMIN);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRegions(GaiadentStorage.getRegions());
    setUsers(GaiadentStorage.getUsers());
    setAuditLogs(GaiadentStorage.getAuditLogs());
  };

  const handleToggleRegion = (regId: string) => {
    const all = regions.map(r => r.id === regId ? { ...r, isActive: !r.isActive } : r);
    GaiadentStorage.setRegions(all);
    setRegions(all);
  };

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regCode) return;

    const newReg: Region = {
      id: `reg-${Date.now()}`,
      name: regName,
      code: regCode.toUpperCase(),
      baseDeliveryTimeHours: regHours,
      isActive: true
    };

    const all = [...regions, newReg];
    GaiadentStorage.setRegions(all);
    setRegions(all);
    setIsRegionModalOpen(false);
    setRegName('');
    setRegCode('');
    setRegHours(48);
    alert(`Región ${regName} agregada con éxito al panel de cobertura.`);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPhone) return;

    const newAdmin: UserProfile = {
      id: `usr-adm-${Date.now()}`,
      role: adminRole,
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      city: adminRole === UserRole.SUPERADMIN ? 'Bolivia Sede' : 'Oruro Sucursal',
      regionId: 'reg-oruro',
      isActive: true,
      pinCode: adminPin || undefined
    };

    const all = [...users, newAdmin];
    GaiadentStorage.setUsers(all);
    setUsers(all);
    setIsAdminModalOpen(false);
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminPin('');
    alert(`Administrador ${adminName} registrado para control de operaciones.`);
  };

  const handleToggleAdminStatus = (usrId: string) => {
    const all = users.map(u => u.id === usrId ? { ...u, isActive: !u.isActive } : u);
    GaiadentStorage.setUsers(all);
    setUsers(all);
  };

  return (
    <div id="superadmin-dashboard" className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Super Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold block">Regiones Cobertura</span>
            <span className="font-extrabold text-sm text-emerald-950">{regions.length} regiones</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold block">Personal Operaciones</span>
            <span className="font-extrabold text-sm text-emerald-950">
              {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPERADMIN).length} cuentas
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold block">Eventos de Auditoría</span>
            <span className="font-extrabold text-sm text-emerald-950">{auditLogs.length} logs</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <Award className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold block">Estado Central</span>
            <span className="font-bold text-xs text-emerald-700">✓ Operando</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('regions')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'regions' ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-gray-500'
          }`}
        >
          <Globe className="w-4 h-4" /> Configuración de Regiones
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'admins' ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" /> Administradores y Repartidores
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-gray-500'
          }`}
        >
          <Activity className="w-4 h-4" /> Registro de Auditoría (Audit Log)
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'regions' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">Regiones de Bolivia Habilitadas</h3>
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              Habilitar Nueva Región
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regions.map(r => (
              <div key={r.id} className="border border-emerald-50 p-4 rounded-2xl flex flex-col justify-between bg-emerald-50/10">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-xs text-emerald-950">{r.name} ({r.code})</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Logística: {r.baseDeliveryTimeHours} hrs de tránsito base
                  </span>
                </div>

                <button
                  onClick={() => handleToggleRegion(r.id)}
                  className={`w-full mt-4 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                    r.isActive ? 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {r.isActive ? 'Desactivar Región' : 'Activar Región'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">Operadores de Logística</h3>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              Registrar Operador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {users.filter(u => u.role !== UserRole.DENTIST).map(usr => (
              <div key={usr.id} className="border border-emerald-50 p-4 rounded-2xl bg-emerald-50/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-emerald-950 block">{usr.name}</span>
                    <span className="text-[9px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                      {usr.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Email: {usr.email}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">Sede: {usr.city}</p>
                  {usr.pinCode && <span className="text-[9px] text-emerald-700 font-bold mt-2 block">🔑 PIN de seguridad configurado</span>}
                </div>

                <button
                  onClick={() => handleToggleAdminStatus(usr.id)}
                  className={`w-full mt-4 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                    usr.isActive ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {usr.isActive ? 'Dar de Baja' : 'Re-Activar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider mb-4">Auditoría General del Sistema</h3>
          <div className="overflow-y-auto max-h-[400px] border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-emerald-50/50 text-emerald-950 font-bold border-b border-gray-100">
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-emerald-50/10">
                    <td className="p-3 text-gray-400 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-950">{log.userName}</td>
                    <td className="p-3 uppercase font-extrabold text-emerald-700 text-[10px]">{log.userRole}</td>
                    <td className="p-3"><span className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">{log.actionType}</span></td>
                    <td className="p-3 text-gray-600">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Region Add Modal */}
      <AnimatePresence>
        {isRegionModalOpen && (
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
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl"
            >
              <h3 className="font-bold text-sm text-emerald-950 mb-3">Habilitar Nueva Región</h3>
              <form onSubmit={handleCreateRegion} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Región *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: La Paz"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Código Prefijo (2 letras) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="Ej: LP"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Tiempo de Tránsito Base (Horas) *</label>
                  <input
                    type="number"
                    required
                    value={regHours}
                    onChange={(e) => setRegHours(Number(e.target.value))}
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-extrabold py-2 rounded-xl transition-all shadow-md"
                >
                  Registrar Cobertura
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operator Add Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
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
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl"
            >
              <h3 className="font-bold text-sm text-emerald-950 mb-3">Registrar Nuevo Operador</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ej: Javier Espinoza"
                    className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="javier@gmail.com"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Teléfono *</label>
                    <input
                      type="text"
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+591 7XXXXXXX"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Rol Operativo</label>
                    <select
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value as UserRole)}
                      className="w-full border border-emerald-100 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none"
                    >
                      <option value={UserRole.ADMIN}>Administrador</option>
                      <option value={UserRole.DELIVERY}>Repartidor</option>
                      <option value={UserRole.SUPERADMIN}>Superadministrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">PIN Seguridad (4 dig)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-full border border-emerald-100 rounded-xl px-3 py-1.5 text-center font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-extrabold py-2 rounded-xl shadow-md"
                >
                  Registrar Operador
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
