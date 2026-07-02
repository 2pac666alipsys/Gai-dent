import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, BookOpen, Plus, MessageSquare, AlertCircle } from 'lucide-react';
import { ChatMessage, Product, UserRole } from '../types';
import { GaiadentStorage } from '../utils/storage';
import GaiadentMascot from './GaiadentMascot';

interface GayitaChatProps {
  onAddProductToCart?: (productId: string) => void;
  currentRole?: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function GayitaChat({
  onAddProductToCart,
  currentRole = UserRole.DENTIST,
  isOpen,
  onClose
}: GayitaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gayita',
      text: '¡Hola, colega! Soy Gäyita, tu asistente dental en Gaiädent. Puedo orientarte en protocolos odontológicos, sugerencias clínicas de insumos y citas de papers científicos que avalan nuestros productos. ¿En qué puedo asistirte hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    setCatalog(GaiadentStorage.getProducts());
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedQuestions = {
    [UserRole.DENTIST]: [
      '¿Cómo es el protocolo de grabado para Resina Filtek Z250?',
      '¿Qué cemento sellador usar con gutapercha .04?',
      '¿Cuál es el beneficio de Geistlich Bio-Oss en implantes?'
    ],
    [UserRole.ADMIN]: [
      '¿Qué productos suelen comprarse juntos en Oruro?',
      'Sugerencias comerciales para reactivar clientes inactivos',
      '¿Cómo optimizar mi inventario antes de consolidar el pedido maestro?'
    ],
    [UserRole.SUPERADMIN]: [
      'Sugerencias comerciales para reactivar clientes inactivos',
      '¿Cómo optimizar mi inventario antes de consolidar el pedido maestro?'
    ],
    [UserRole.DELIVERY]: [
      '¿Cómo registrar devoluciones parciales eficientemente?',
      'Consejo para rutas con GPS en Oruro'
    ]
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-6).map((msg) => ({
        sender: msg.sender,
        text: msg.text
      }));

      const response = await fetch('/api/gayita/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          currentRole,
          products: GaiadentStorage.getProducts(),
          orders: GaiadentStorage.getOrders(),
          users: GaiadentStorage.getUsers(),
          promotions: GaiadentStorage.getPromotions()
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();

      const gayitaMsg: ChatMessage = {
        id: `gayita-${Date.now()}`,
        sender: 'gayita',
        text: data.text || 'He tenido una pequeña interrupción en mi señal clínica. Por favor, vuelve a consultarme en unos segundos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        recommendedProductIds: data.recommendedProductIds || []
      };

      setMessages((prev) => [...prev, gayitaMsg]);
      GaiadentStorage.addAuditLog(
        'usr-gayita',
        'Gäyita AI',
        'admin' as any,
        'Consulta AI',
        `Respondió a consulta de rol ${currentRole}: "${textToSend.substring(0, 30)}..."`
      );

    } catch (error) {
      console.error('Error talking to Gäyita:', error);
      // Fallback offline rules
      setTimeout(() => {
        const fallbackResponse = getLocalFallback(textToSend, currentRole);
        setMessages((prev) => [...prev, fallbackResponse]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalFallback = (text: string, role: string): ChatMessage => {
    const query = text.toLowerCase();
    let reply = "Estoy en un consultorio un poco atareado ahora mismo, pero te puedo decir que en Gaiädent priorizamos la bioseguridad y materiales clase A. Por favor, revisa las fichas técnicas en nuestro catálogo.";
    let citationsList: any[] = [];
    let recomIds: string[] = [];

    if (query.includes("resina") || query.includes("filtek") || query.includes("z250")) {
      reply = "La Resina Filtek Z250 XT es idónea para restauraciones estéticas gracias a su tecnología de carga híbrida de zirconia y sílice. Te sugiero usar el Adhesivo Single Bond Universal con grabado ácido selectivo en esmalte para reducir al máximo la sensibilidad postoperatoria en dentina profunda.";
      citationsList = [{ title: "Anusavice, K. J. (2013). Science of Dental Materials.", snippet: "Recomienda espesores de incremento de resinas menores a 2mm para un curado del 100%." }];
      recomIds = ["prod-filtek-z250", "prod-singlebond"];
    } else if (query.includes("adhes") || query.includes("singlebond")) {
      reply = "El Adhesivo Single Bond Universal contiene monómeros de MDP que permiten fijar restauraciones a esmalte, dentina e incluso cerámicas ácidas de manera confiable.";
      citationsList = [{ title: "Van Meerbeek, B. et al. (2011). Self-etching adhesives.", snippet: "Analiza la formación de capas híbridas estables por interacción química del monómero MDP." }];
      recomIds = ["prod-singlebond"];
    } else if (role === 'admin' || role === 'superadmin' || query.includes("juntos") || query.includes("comprar")) {
      reply = "Estimado administrador, nuestro análisis de ventas en Oruro revela que el 65% de las clínicas que ordenan resinas añaden también adhesivos en el mismo pedido. Recomiendo armar un paquete promocional 'Restauración Perfecta' con un 5% de descuento en el adhesivo por la compra de tres resinas.";
      recomIds = ["prod-filtek-z250", "prod-singlebond"];
    }

    return {
      id: `gayita-offline-${Date.now()}`,
      sender: 'gayita',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: citationsList,
      recommendedProductIds: recomIds
    };
  };

  const getProductDetails = (id: string): Product | undefined => {
    return catalog.find((p) => p.id === id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="gayita-chat-drawer"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed right-4 bottom-4 top-4 w-96 bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <GaiadentMascot 
                size="sm" 
                isAnimated={true} 
                onClick={onClose} 
                className="hover:scale-110 active:scale-95 transition-all" 
                title="Minimizar chat"
              />
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1">
                  Gäyita IA <Sparkles className="w-3.5 h-3.5 text-mint-300 fill-mint-300" />
                </h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Especialista de Protocolos
                </span>
              </div>
            </div>
            <button
              id="close-gayita-chat"
              onClick={onClose}
              className="p-1.5 hover:bg-emerald-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-emerald-50/30 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%]">
                      <div
                        className={`rounded-2xl p-3 shadow-sm text-xs ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white border border-emerald-100 text-emerald-950 rounded-tl-none'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                            <Bot className="w-3 h-3" />
                            <span>Gäyita</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                        {/* Citations / Papers Panel */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-100/50 space-y-1">
                            <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-emerald-600" />
                              Sustento Científico:
                            </div>
                            {msg.citations.map((cite, cIdx) => (
                              <div key={cIdx} className="text-[10px] bg-emerald-50/50 p-1.5 rounded border border-emerald-100/30">
                                <span className="font-semibold block text-emerald-800">{cite.title}</span>
                                {cite.snippet && <span className="text-emerald-700 block mt-0.5">{cite.snippet}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recommended Products */}
                        {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-emerald-100/50">
                            <div className="text-[10px] text-emerald-800 font-semibold mb-1">Insumos Relacionados:</div>
                            <div className="space-y-1.5">
                              {msg.recommendedProductIds.map((pId) => {
                                const prod = getProductDetails(pId);
                                if (!prod) return null;
                                return (
                                  <div
                                    key={pId}
                                    className="flex items-center justify-between gap-2 p-1.5 bg-emerald-50/60 rounded border border-emerald-100/40 text-[10px]"
                                  >
                                    <div className="truncate">
                                      <span className="font-bold block text-emerald-900 truncate">{prod.name}</span>
                                      <span className="text-[9px] text-emerald-700">{prod.brand} • BOB {prod.price}</span>
                                    </div>
                                    {onAddProductToCart && (
                                      <button
                                        onClick={() => onAddProductToCart(pId)}
                                        className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all flex items-center shrink-0"
                                        title="Agregar al Carrito"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 block px-1 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <GaiadentMascot size="sm" isAnimated={true} className="shrink-0 scale-75" />
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="p-2 border-t border-emerald-100 bg-white">
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {suggestedQuestions[currentRole]?.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-full px-2.5 py-1 font-medium transition-all max-w-[200px] truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-emerald-100 bg-white flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Pregúntale a Gäyita sobre insumos..."
              className="flex-1 border border-emerald-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center shrink-0 disabled:bg-gray-300"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
