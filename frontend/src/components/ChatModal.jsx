import React, { useState } from 'react';
import { X, Send, ShieldCheck, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ isOpen, onClose, neighbor, postTitle }) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: 'neighbor',
      text: `¡Hola vecino! Soy ${neighbor?.nombre || 'tu vecino'}. Vi tu interés${
        postTitle ? ` en "${postTitle}"` : ''
      }. ¿En qué te puedo colaborar hoy?`,
      time: 'Hace 1 min'
    }
  ]);

  if (!isOpen || !neighbor) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'neighbor',
        text: '¡Perfecto vecino! Estoy a un par de cuadras en el barrio. Coordinemos por aquí con total seguridad.',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[94%] sm:w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[82vh] max-h-[600px]">
        {/* Cabecera estilo mensajería segura */}
        <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-100 font-bold flex items-center justify-center shrink-0 border border-emerald-400">
              {neighbor.nombre?.[0]?.toUpperCase() || 'V'}
              {neighbor.apellido?.[0]?.toUpperCase() || ''}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {neighbor.nombre} {neighbor.apellido}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>Barrio {neighbor.barrio || 'Verificado'} • En línea</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full hover:bg-emerald-800 flex items-center justify-center text-white transition shrink-0"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso de privacidad barrial */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-2 text-[11px] text-emerald-900 flex items-center gap-2 shrink-0">
          <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Chat interno protegido: tu teléfono y dirección exacta permanecen privados.
          </span>
        </div>

        {/* Lista de Burbujas */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100">
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isMe ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Táctil */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribe un mensaje a ${neighbor.nombre}...`}
            className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 text-slate-900"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;