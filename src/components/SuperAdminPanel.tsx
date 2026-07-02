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
  Award,
  Edit3,
  Trash2,
  Search,
  MapPin
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
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminRole, setAdminRole] = useState<UserRole>(UserRole.ADMIN);

  // Additional fields for users (dentists and general)
  const [userClinicName, setUserClinicName] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userCity, setUserCity] = useState('Oruro');
  const [userRegionId, setUserRegionId] = useState('reg-oruro');
  const [userIsActive, setUserIsActive] = useState(true);

  // Search & Filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

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

  const startEditingUser = (usr: UserProfile) => {
    setEditingUser(usr);
    setAdminName(usr.name);
    setAdminEmail(usr.email);
    setAdminPhone(usr.phone);
    setAdminRole(usr.role);
    setAdminPin(usr.pinCode || '');
    setUserClinicName(usr.clinicName || '');
    setUserAddress(usr.address || '');
    setUserCity(usr.city || 'Oruro');
    setUserRegionId(usr.regionId || 'reg-oruro');
    setUserIsActive(usr.isActive);
    setIsAdminModalOpen(true);
  };

  const closeUserModal = () => {
    setIsAdminModalOpen(false);
    setEditingUser(null);
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminRole(UserRole.ADMIN);
    setAdminPin('');
    setUserClinicName('');
    setUserAddress('');
    setUserCity('Oruro');
    setUserRegionId('reg-oruro');
    setUserIsActive(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPhone) return;

    let updatedList: UserProfile[];

    if (editingUser) {
      updatedList = users.map(u => u.id === editingUser.id ? {
        ...u,
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        role: adminRole,
        pinCode: adminPin || undefined,
        clinicName: adminRole === UserRole.DENTIST ? userClinicName : undefined,
        address: adminRole === UserRole.DENTIST ? userAddress : undefined,
        city: userCity,
        regionId: userRegionId,
        isActive: userIsActive
      } : u);
      alert(`La cuenta de ${adminName} ha sido modificada con éxito.`);
      GaiadentStorage.addAuditLog(
        'superadmin',
        'Super Administrador',
        UserRole.SUPERADMIN,
        'Modificar Usuario',
        `Se editó la cuenta del usuario: ${adminName} (${adminRole})`
      );
    } else {
      const newUser: UserProfile = {
        id: `usr-${adminRole}-${Date.now()}`,
        role: adminRole,
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        city: userCity,
        regionId: userRegionId,
        isActive: true,
        pinCode: adminPin || undefined,
        clinicName: adminRole === UserRole.DENTIST ? userClinicName : undefined,
        address: adminRole === UserRole.DENTIST ? userAddress : undefined,
      };
      updatedList = [...users, newUser];
      alert(`El usuario ${adminName} ha sido registrado con éxito.`);
      GaiadentStorage.addAuditLog(
        'superadmin',
        'Super Administrador',
        UserRole.SUPERADMIN,
        'Crear Usuario',
        `Se creó el usuario: ${adminName} con rol ${adminRole}`
      );
    }

    GaiadentStorage.setUsers(updatedList);
    setUsers(updatedList);
    closeUserModal();
  };

  const handleDeleteUser = (usrId: string, name: string) => {
    if (confirm(`¿Está seguro de que desea eliminar permanentemente la cuenta de ${name}? Esta acción no se puede deshacer.`)) {
      const updated = users.filter(u => u.id !== usrId);
      GaiadentStorage.setUsers(updated);
      setUsers(updated);
      GaiadentStorage.addAuditLog(
        'superadmin',
        'Super Administrador',
        UserRole.SUPERADMIN,
        'Eliminar Usuario',
        `Se eliminó permanentemente la cuenta de: ${name}`
      );
      alert(`Cuenta de ${name} eliminada permanentemente.`);
    }
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
          <Users className="w-4 h-4" /> Gestión Completa de Usuarios
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
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">Directorio y Control de Cuentas de Usuario</h3>
              <p className="text-[11px] text-gray-400 mt-1">Crea, modifica o elimina cuentas de Odontólogos, Administradores, Repartidores y Superadmins.</p>
            </div>
            <button
              onClick={() => {
                closeUserModal(); // reset states
                setIsAdminModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Usuario
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative col-span-1 sm:col-span-2">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, email, clínica, teléfono..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-400"
              />
            </div>
            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold text-slate-700"
              >
                <option value="all">Todos los Roles</option>
                <option value={UserRole.DENTIST}>Odontólogos / Doctores</option>
                <option value={UserRole.ADMIN}>Administradores de Sucursal</option>
                <option value={UserRole.DELIVERY}>Repartidores de Ruta</option>
                <option value={UserRole.SUPERADMIN}>Superadministradores</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(usr => {
              const query = userSearchQuery.toLowerCase();
              const matchesSearch = usr.name.toLowerCase().includes(query) ||
                                    usr.email.toLowerCase().includes(query) ||
                                    (usr.phone && usr.phone.includes(query)) ||
                                    (usr.clinicName && usr.clinicName.toLowerCase().includes(query)) ||
                                    (usr.city && usr.city.toLowerCase().includes(query));
              const matchesRole = userRoleFilter === 'all' || usr.role === userRoleFilter;
              return matchesSearch && matchesRole;
            }).map(usr => {
              // Custom Role styles
              const roleBadgeClass = 
                usr.role === UserRole.SUPERADMIN ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                usr.role === UserRole.ADMIN ? 'bg-amber-50 border-amber-100 text-amber-700' :
                usr.role === UserRole.DENTIST ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                'bg-sky-50 border-sky-100 text-sky-700';

              const roleLabel = 
                usr.role === UserRole.SUPERADMIN ? 'Super Admin' :
                usr.role === UserRole.ADMIN ? 'Administrador' :
                usr.role === UserRole.DENTIST ? 'Odontólogo' :
                'Repartidor';

              return (
                <div key={usr.id} className="border border-slate-200/60 bg-white hover:border-emerald-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
                  <div>
                    {/* Header: Role and Active status */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 border rounded-lg uppercase tracking-wider ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${usr.isActive ? 'bg-emerald-600/10 text-emerald-800' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {usr.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Name & Basic info */}
                    <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-1.5">
                      {usr.role === UserRole.DENTIST ? '🩺' : usr.role === UserRole.DELIVERY ? '📦' : '👤'} {usr.name}
                    </h4>
                    
                    {usr.role === UserRole.DENTIST && usr.clinicName && (
                      <p className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-1">
                        🏢 {usr.clinicName}
                      </p>
                    )}

                    <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-500 leading-tight">
                      <p className="flex items-center gap-1.5"><span className="text-slate-400">✉</span> <strong className="font-semibold text-slate-600">Email:</strong> {usr.email}</p>
                      <p className="flex items-center gap-1.5"><span className="text-slate-400">📞</span> <strong className="font-semibold text-slate-600">Celular:</strong> {usr.phone}</p>
                      <p className="flex items-center gap-1.5"><span className="text-slate-400">📍</span> <strong className="font-semibold text-slate-600">Ciudad/Región:</strong> {usr.city} ({usr.regionId})</p>
                      
                      {usr.role === UserRole.DENTIST && usr.address && (
                        <p className="flex items-start gap-1.5 mt-1.5 bg-slate-50 p-2 rounded-xl text-slate-500 border border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{usr.address}</span>
                        </p>
                      )}

                      {usr.pinCode && (
                        <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100/50 rounded-lg px-2 py-0.5 inline-block mt-2">
                          🔑 PIN: {usr.pinCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => startEditingUser(usr)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-100 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    
                    <button
                      onClick={() => handleToggleAdminStatus(usr.id)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs border transition-all ${
                        usr.isActive 
                          ? 'bg-red-50 hover:bg-red-100/80 text-red-700 border-red-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title={usr.isActive ? 'Dar de Baja Temporal' : 'Activar Cuenta'}
                    >
                      {usr.isActive ? 'Baja' : 'Alta'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(usr.id, usr.name)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-100 text-slate-400 hover:text-red-600 transition-all"
                      title="Eliminar Cuenta Permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {users.filter(usr => {
              const query = userSearchQuery.toLowerCase();
              const matchesSearch = usr.name.toLowerCase().includes(query) ||
                                    usr.email.toLowerCase().includes(query) ||
                                    (usr.phone && usr.phone.includes(query)) ||
                                    (usr.clinicName && usr.clinicName.toLowerCase().includes(query));
              const matchesRole = userRoleFilter === 'all' || usr.role === userRoleFilter;
              return matchesSearch && matchesRole;
            }).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-xs">No se encontraron usuarios que coincidan con la búsqueda.</p>
              </div>
            )}
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

      {/* Operator/User Create and Edit Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
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
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-100 shadow-2xl my-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={closeUserModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 hover:bg-slate-100 rounded-full transition-all"
                type="button"
              >
                ✕
              </button>

              <h3 className="font-extrabold text-sm text-emerald-950 mb-4 flex items-center gap-1.5">
                👤 {editingUser ? 'Modificar Cuenta de Usuario' : 'Registrar Nuevo Usuario'}
              </h3>
              
              <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                {/* Full name field */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ej: Dra. María Elena Perez"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-xs text-slate-800"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="maria@gaiadent.com"
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Celular / Teléfono *</label>
                    <input
                      type="text"
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+591 7XXXXXXX"
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Role selection & Pin Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Rol de Acceso *</label>
                    <select
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value as UserRole)}
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-700 text-xs"
                    >
                      <option value={UserRole.DENTIST}>Odontólogo / Cliente</option>
                      <option value={UserRole.ADMIN}>Administrador de Sucursal</option>
                      <option value={UserRole.DELIVERY}>Repartidor de Logística</option>
                      <option value={UserRole.SUPERADMIN}>Superadministrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">PIN Seguridad (4 dígitos)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 1234"
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-center font-bold tracking-widest text-xs"
                    />
                  </div>
                </div>

                {/* Conditional Fields: Dentist Clinical Details */}
                {adminRole === UserRole.DENTIST && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60"
                  >
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-1">Información de Clínica Odontológica</span>
                    
                    <div>
                      <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Nombre del Consultorio / Clínica *</label>
                      <input
                        type="text"
                        required={adminRole === UserRole.DENTIST}
                        value={userClinicName}
                        onChange={(e) => setUserClinicName(e.target.value)}
                        placeholder="Ej: Clínica Dental San Lucas"
                        className="w-full border border-slate-200 bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Dirección del Consultorio *</label>
                      <input
                        type="text"
                        required={adminRole === UserRole.DENTIST}
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        placeholder="Ej: Calle Pagador #1420 entre Aldana y Murguia"
                        className="w-full border border-slate-200 bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Geography settings */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Ciudad Sede</label>
                    <input
                      type="text"
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                      placeholder="Ej: Oruro"
                      className="w-full border border-slate-200 bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Región Logística</label>
                    <select
                      value={userRegionId}
                      onChange={(e) => setUserRegionId(e.target.value)}
                      className="w-full border border-slate-200 bg-white focus:border-emerald-500 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    >
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Status Toggle (Only visible during Editing) */}
                {editingUser && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Estado de la Cuenta</span>
                      <span className="text-[10px] text-slate-500">¿Habilitar el ingreso y operaciones de este usuario?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userIsActive} 
                        onChange={(e) => setUserIsActive(e.target.checked)}
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
                    onClick={closeUserModal}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow-md shadow-emerald-100 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Registrar Cuenta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
