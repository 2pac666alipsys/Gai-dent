import { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import { GaiadentStorage, initializeGaiadentStorage } from './utils/storage';
import Splash from './components/Splash';
import LoginForm from './components/LoginForm';
import DentistPanel from './components/DentistPanel';
import AdminPanel from './components/AdminPanel';
import RiderPanel from './components/RiderPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import GayitaChat from './components/GayitaChat';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Sparkles, Shield, User, RefreshCw, KeyRound, Menu } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    // Initialize storage with seeds
    initializeGaiadentStorage();
    
    // Check if user is already logged in
    const cachedUser = localStorage.getItem('gaiadent_current_user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }

    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = GaiadentStorage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    updateCartCount();
  };

  const handleLogout = () => {
    if (currentUser) {
      GaiadentStorage.addAuditLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Cerrar Sesión',
        'El usuario cerró su sesión de manera voluntaria.'
      );
    }
    localStorage.removeItem('gaiadent_current_user');
    setCurrentUser(null);
  };

  const handleRoleQuickSwitch = (role: UserRole) => {
    const allUsers = GaiadentStorage.getUsers();
    const matchedUser = allUsers.find(u => u.role === role);
    if (matchedUser) {
      GaiadentStorage.setCurrentUser(matchedUser);
      setCurrentUser(matchedUser);
      updateCartCount();
      GaiadentStorage.addAuditLog(
        matchedUser.id,
        matchedUser.name,
        matchedUser.role,
        'Cambio Rápido Rol',
        `Evaluación cambió al rol operativo de: ${role}`
      );
    }
  };

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg shadow-emerald-100 flex items-center justify-center border border-slate-100">
              <img
                src="/src/assets/images/luffy_launcher_icon_1782877105670.jpg"
                alt="Gaiadent Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const p = e.currentTarget.parentElement;
                  if (p) {
                    const icon = document.createElement('span');
                    icon.className = 'text-xl font-bold text-emerald-600';
                    icon.innerText = '🩺';
                    p.appendChild(icon);
                  }
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-950 flex items-center gap-2 font-serif">
                Gaiädent <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">Oruro</span>
              </h1>
              <span className="text-[8px] font-bold text-slate-400 tracking-widest block uppercase mt-0.5">
                Salud · Armonía · Sonrisa
              </span>
            </div>
          </div>

          {/* Quick-eval Switcher and Profile */}
          {currentUser && (
            <div className="flex items-center gap-4">
              
              {/* Quick Role Toggle Bar for Easy Verification */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200/60 mr-2">
                <span className="text-[10px] text-slate-500 font-extrabold px-3.5 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Evaluar Rol:
                </span>
                <button
                  onClick={() => handleRoleQuickSwitch(UserRole.DENTIST)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentUser.role === UserRole.DENTIST ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-slate-600 hover:bg-slate-200/60'}`}
                >
                  Odontólogo
                </button>
                <button
                  onClick={() => handleRoleQuickSwitch(UserRole.ADMIN)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentUser.role === UserRole.ADMIN ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-slate-600 hover:bg-slate-200/60'}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleQuickSwitch(UserRole.SUPERADMIN)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentUser.role === UserRole.SUPERADMIN ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-slate-600 hover:bg-slate-200/60'}`}
                >
                  SuperAdmin
                </button>
                <button
                  onClick={() => handleRoleQuickSwitch(UserRole.DELIVERY)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentUser.role === UserRole.DELIVERY ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'text-slate-600 hover:bg-slate-200/60'}`}
                >
                  Repartidor
                </button>
              </div>

              {/* Profile display & Action logout */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5 block">
                    {currentUser.role === UserRole.SUPERADMIN ? 'Superadministrador' : currentUser.role === UserRole.ADMIN ? 'Administrador Sucursal' : currentUser.role === UserRole.DELIVERY ? 'Repartidor Ruta' : 'Doctor(a)'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl border border-slate-200/60 hover:border-red-100 transition-all shadow-xs"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1">
        {!currentUser ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="py-4">
            {currentUser.role === UserRole.SUPERADMIN && <SuperAdminPanel />}
            {currentUser.role === UserRole.ADMIN && <AdminPanel currentUser={currentUser} />}
            {currentUser.role === UserRole.DENTIST && (
              <DentistPanel
                currentUser={currentUser}
                onUpdateUser={setCurrentUser}
                onOpenAssistant={() => setIsAssistantOpen(true)}
                cartCount={cartCount}
                onCartUpdated={updateCartCount}
              />
            )}
            {currentUser.role === UserRole.DELIVERY && <RiderPanel currentUser={currentUser} />}
          </div>
        )}
      </main>

      {/* Footer Branding credits */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 border-t border-slate-800 mt-16 text-xs px-6 rounded-t-3xl shadow-inner">
        <p className="font-bold text-slate-200 tracking-wider font-serif text-sm">Gaiädent Cobertura Nacional Bolivia</p>
        <p className="text-[11px] text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          Oruro Almacén Central • Sucursal Principal Santa Cruz de la Sierra • Insumos Dentales de Calidad Superior
        </p>
        <div className="mt-4 w-12 h-1 bg-emerald-600/60 mx-auto rounded-full"></div>
        <p className="text-[10px] text-slate-600 mt-3">
          © 2026 Gaiädent S.R.L. Todos los derechos reservados.
        </p>
      </footer>

      {/* Assistant Chatbot Integration Drawer */}
      {currentUser && (
        <>
          {/* Floating trigger button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-full shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center gap-1.5"
            title="Preguntar a Gäyita IA"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs pr-1 font-semibold">Gäyita IA</span>
          </button>

          <GayitaChat
            onAddProductToCart={(pId) => {
              const currentCart = GaiadentStorage.getCart();
              const existingIndex = currentCart.findIndex(item => item.productId === pId);
              
              if (existingIndex > -1) {
                currentCart[existingIndex].quantity += 1;
              } else {
                currentCart.push({ productId: pId, quantity: 1 });
              }
              
              GaiadentStorage.setCart(currentCart);
              updateCartCount();
              alert('¡Insumo relacionado añadido al carrito con éxito!');
            }}
            currentRole={currentUser.role as any}
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
          />
        </>
      )}

    </div>
  );
}
