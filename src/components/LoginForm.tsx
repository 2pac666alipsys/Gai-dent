import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserRole, UserProfile, Region } from '../types';
import { GaiadentStorage } from '../utils/storage';
import { Shield, Sparkles, MapPin, KeyRound, Smartphone, Mail, Lock, User, Briefcase, ChevronRight, HelpCircle } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: UserProfile) => void;
  onGoToSplash?: () => void;
}

export default function LoginForm({ onLoginSuccess, onGoToSplash }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Oruro');
  const [regionId, setRegionId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Switcher / Presets for Fast Evaluation
  const [selectedPresetId, setSelectedPresetId] = useState('');

  useEffect(() => {
    setRegions(GaiadentStorage.getRegions().filter(r => r.isActive));
    const allUsers = GaiadentStorage.getUsers();
    setUsers(allUsers);
    
    // Set default region to Oruro
    const oruroReg = GaiadentStorage.getRegions().find(r => r.code === 'OR');
    if (oruroReg) {
      setRegionId(oruroReg.id);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email && !phone) {
      setErrorMsg('Debe ingresar un Correo Electrónico o Teléfono.');
      return;
    }

    const matchedUser = users.find(
      (u) => 
        (email && u.email.toLowerCase() === email.toLowerCase()) || 
        (phone && u.phone === phone)
    );

    if (!matchedUser) {
      setErrorMsg('Usuario no registrado. Regístrese o use uno de los accesos rápidos de evaluación.');
      return;
    }

    // Require PIN if set
    if (matchedUser.pinCode) {
      const enteredPin = prompt(`Por favor, ingrese el PIN de seguridad de 4 dígitos para el Dr(a). ${matchedUser.name}:`);
      if (enteredPin === null) return;
      if (enteredPin !== matchedUser.pinCode) {
        setErrorMsg('PIN de seguridad incorrecto.');
        alert('PIN de seguridad incorrecto. Para fines de prueba, puede usar los accesos rápidos abajo sin escribir contraseña.');
        return;
      }
    }

    GaiadentStorage.setCurrentUser(matchedUser);
    GaiadentStorage.addAuditLog(matchedUser.id, matchedUser.name, matchedUser.role, 'Inicio de Sesión', 'El usuario inició sesión exitosamente.');
    onLoginSuccess(matchedUser);
  };

  const handleQuickLogin = (user: UserProfile) => {
    GaiadentStorage.setCurrentUser(user);
    GaiadentStorage.addAuditLog(user.id, user.name, user.role, 'Inicio de Sesión (Rápido)', 'Inicio de sesión por acceso rápido de evaluación.');
    onLoginSuccess(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !address || !regionId) {
      setErrorMsg('Por favor complete todos los campos requeridos (*).');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-dentist-${Date.now()}`,
      role: UserRole.DENTIST,
      name,
      email,
      phone,
      clinicName: clinicName || 'Consultorio Dental Estándar',
      address,
      city,
      regionId,
      gpsCoordinates,
      isActive: true,
      pinCode: pinCode || undefined,
      biometricEnabled: false
    };

    const updatedUsers = [...users, newUser];
    GaiadentStorage.setUsers(updatedUsers);
    setUsers(updatedUsers);

    GaiadentStorage.setCurrentUser(newUser);
    GaiadentStorage.addAuditLog(newUser.id, newUser.name, newUser.role, 'Registro', 'Se registró una nueva clínica dental en el sistema.');
    onLoginSuccess(newUser);
  };

  const fetchGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert(`Ubicación registrada: Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error fetching GPS', error);
          // Set Oruro standard fallback
          setGpsCoordinates({ lat: -17.9642, lng: -67.1105 });
          alert('Ubicación capturada con simulador GPS para Oruro (-17.9642, -67.1105).');
        }
      );
    } else {
      alert('Geolocalización no soportada en este navegador.');
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 w-full">
      
      {/* Evaluation Header for AI Studio */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
        <h2 className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Acceso de Evaluación para el Administrador
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl mx-auto">
          La aplicación simula roles y logísticas nacionales de Gaiädent (Bolivia). Elige un rol preestablecido para evaluar el flujo de inmediato.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {users.map((u) => {
            const roleColors: Record<UserRole, string> = {
              [UserRole.SUPERADMIN]: 'bg-slate-50 hover:bg-red-50/50 text-red-700 border border-red-100 hover:border-red-200',
              [UserRole.ADMIN]: 'bg-slate-50 hover:bg-amber-50/50 text-amber-700 border border-amber-100 hover:border-amber-200',
              [UserRole.DENTIST]: 'bg-slate-50 hover:bg-emerald-50/50 text-emerald-700 border border-emerald-100 hover:border-emerald-200',
              [UserRole.DELIVERY]: 'bg-slate-50 hover:bg-blue-50/50 text-blue-700 border border-blue-100 hover:border-blue-200',
            };
            const roleNames: Record<UserRole, string> = {
              [UserRole.SUPERADMIN]: 'SuperAdmin',
              [UserRole.ADMIN]: 'Admin',
              [UserRole.DENTIST]: 'Odontólogo',
              [UserRole.DELIVERY]: 'Repartidor',
            };
            return (
              <button
                key={u.id}
                onClick={() => handleQuickLogin(u)}
                className={`text-[11px] font-bold p-3 rounded-xl transition-all shadow-xs text-left flex flex-col justify-between ${roleColors[u.role]}`}
              >
                <span className="truncate">{u.name.split(' ')[0]} {u.name.split(' ')[1] || ''}</span>
                <span className="text-[9px] opacity-90 block mt-1 uppercase tracking-wider font-mono">
                  🔑 {roleNames[u.role]} {u.pinCode ? `(PIN: ${u.pinCode})` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div 
            onClick={onGoToSplash}
            className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100/60 mb-3 overflow-hidden shadow-inner cursor-pointer hover:scale-110 active:scale-95 transition-all"
            title="Ir al inicio de la app"
          >
            <img
              src="/src/assets/images/luffy_launcher_icon_1782877105670.jpg"
              alt="Gaiadent"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const s = document.createElement('div');
                  s.className = 'text-3xl';
                  s.innerText = '🩺';
                  parent.appendChild(s);
                }
              }}
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-serif">Gaiädent Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRegistering ? 'Crea tu cuenta odontológica profesional' : 'Inicia sesión con tu Correo o Teléfono'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs mb-4 text-center font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {!isRegistering ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setPhone(''); }}
                  placeholder="ejemplo@correo.com"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <span className="bg-white px-2 text-[10px] text-slate-400 font-bold z-10">O BIEN</span>
              <div className="absolute w-full border-t border-slate-100"></div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">NÚMERO DE TELÉFONO</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setEmail(''); }}
                  placeholder="+591 7XXXXXXX"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <button
              id="submit-login"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1 mt-4"
            >
              Ingresar al Portal <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          // REGISTRATION FORM
          <form onSubmit={handleRegister} className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">NOMBRE COMPLETO DEL DOCTOR(A) *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dra. María Martínez"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">NOMBRE DE LA CLÍNICA DENTAL *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Clínica Dental Altiplano"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">CORREO *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@gmail.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">TELÉFONO *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+591 60000000"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">DIRECCIÓN DE ENTREGA *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle Sucre y Pagador Nro 125"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 focus:bg-white transition-all focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">CIUDAD</label>
                <input
                  type="text"
                  readOnly
                  value={city}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">REGIÓN COBERTURA *</label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all focus:outline-none"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.baseDeliveryTimeHours} hrs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PIN de Seguridad Setup */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest font-sans">PIN SEGURIDAD (4 Dígitos)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all focus:outline-none text-center font-bold tracking-widest"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchGpsLocation}
                  className="w-full bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2 rounded-lg text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ubicación GPS
                </button>
              </div>
            </div>

            {gpsCoordinates && (
              <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center font-medium">
                📍 Coordenadas guardadas: {gpsCoordinates.lat.toFixed(4)}, {gpsCoordinates.lng.toFixed(4)}
              </p>
            )}

            <button
              id="submit-register"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-md shadow-emerald-100 mt-2"
            >
              Registrarse y Entrar
            </button>
          </form>
        )}

        {/* Footer Switching Area */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs">
          <p className="text-slate-400 font-medium">
            {isRegistering ? '¿Ya eres cliente?' : '¿Nuevo odontólogo en Oruro?'}
          </p>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline mt-1"
          >
            {isRegistering ? 'Iniciar sesión aquí' : 'Crea tu cuenta aquí'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
