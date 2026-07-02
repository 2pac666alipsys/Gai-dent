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
import GaiadentMascot from './components/GaiadentMascot';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Sparkles, Shield, User, RefreshCw, KeyRound, Menu, Sun, Moon } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('gaiadent_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gaiadent_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gaiadent_theme', 'light');
    }
  }, [isDarkMode]);

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

  const handleGoToStart = () => {
    // Return to splash screen and reset active states/tabs to their start view without logging out
    setShowSplash(true);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans flex flex-col justify-between`}>
      
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <>
          {/* Navigation Header */}
          <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shadow-sm px-6 py-4 shrink-0 transition-colors">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              
              {/* Logo Brand Title */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={handleGoToStart}
                  className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center border border-slate-100 dark:border-slate-800 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  title="Ir al inicio de la app"
                >
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
                  <h1 className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-400 flex items-center gap-2 font-serif">
                    Gaiädent <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/40">Oruro</span>
                  </h1>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-widest block uppercase mt-0.5">
                    Salud · Armonía · Sonrisa
                  </span>
                </div>
              </div>

              {/* Draggable Gäyita Mascot in Header (Default starting position) */}
              <div className="flex items-center justify-center z-40 relative">
                <GaiadentMascot
                  size="md"
                  isAnimated={true}
                  withBubble={true}
                  bubblePosition="bottom"
                  bubbleText={isAssistantOpen ? "¡Conversando! 😊" : "¡Hola! Hazme clic o arrástrame 🚀"}
                  onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                  drag={true}
                  title="Gäyita IA - ¡Arrástrame a cualquier parte de la pantalla!"
                  className="transition-shadow drop-shadow-md hover:drop-shadow-lg"
                />
              </div>

              {/* Right Side Header Controls Container */}
              <div className="flex items-center gap-4">
                
                {/* Dark Mode Switch / Selector */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200/50 dark:border-slate-600/50 transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                    title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                  >
                    {isDarkMode ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                  </button>
                  <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-2 select-none hidden sm:inline">
                    {isDarkMode ? 'Oscuro' : 'Claro'}
                  </span>
                </div>

                {/* Quick-eval Switcher and Profile */}
                {currentUser && (
                  <div className="flex items-center gap-4">
                    
                    {/* Quick Role Toggle Bar for Easy Verification */}
                    <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60 mr-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold px-3.5 uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Evaluar Rol:
                      </span>
                      <button
                        onClick={() => handleRoleQuickSwitch(UserRole.DENTIST)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${currentUser.role === UserRole.DENTIST ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'}`}
                      >
                        Odontólogo
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch(UserRole.ADMIN)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${currentUser.role === UserRole.ADMIN ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'}`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch(UserRole.SUPERADMIN)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${currentUser.role === UserRole.SUPERADMIN ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'}`}
                      >
                        SuperAdmin
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch(UserRole.DELIVERY)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${currentUser.role === UserRole.DELIVERY ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'}`}
                      >
                        Repartidor
                      </button>
                    </div>

                    {/* Profile display & Action logout */}
                    <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block leading-tight">{currentUser.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-0.5 block">
                          {currentUser.role === UserRole.SUPERADMIN ? 'Superadministrador' : currentUser.role === UserRole.ADMIN ? 'Administrador Sucursal' : currentUser.role === UserRole.DELIVERY ? 'Repartidor Ruta' : 'Doctor(a)'}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="p-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-red-100 dark:hover:border-red-900/30 transition-all shadow-xs cursor-pointer"
                        title="Cerrar Sesión"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </header>

          {/* Main Container Area */}
          <main className="flex-1" key={resetKey}>
            {!currentUser ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} onGoToSplash={() => setShowSplash(true)} />
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
        </>
      )}

      {/* Assistant Chatbot Integration Drawer */}
      <>
        <GayitaChat
          onAddProductToCart={(pId) => {
            if (!currentUser) {
              alert('Por favor, inicia sesión para poder añadir insumos al carrito.');
              return;
            }
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
          currentRole={currentUser?.role as any || UserRole.DENTIST}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />
      </>

    </div>
  );
}
