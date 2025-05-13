import React, { useState } from 'react';

interface PropiedadesEntradaMensaje {
  alEnviarMensaje: (texto: string) => void;
  estadoConexion?: 'conectado' | 'desconectado' | 'conectando';
}

const EntradaMensaje: React.FC<PropiedadesEntradaMensaje> = ({ 
  alEnviarMensaje, 
  estadoConexion = 'desconectado' 
}) => {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = () => {
    if (mensaje.trim()) {
      setEnviando(true);
      
      // Enviar el mensaje
      alEnviarMensaje(mensaje);
      
      // Limpiar el campo de texto
      setMensaje('');
      
      // Simular tiempo de procesamiento para mejor UX
      setTimeout(() => {
        setEnviando(false);
      }, 300);
    }
  };

  const manejarTeclaPresionada = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      manejarEnvio();
    }
  };

  // Determinar si debemos deshabilitar el control de entrada
  const inputDeshabilitado = enviando || estadoConexion === 'conectando';
  
  // Determinar el estilo del botón basado en el estado de conexión
  const obtenerClaseBoton = () => {
    if (enviando) return "bg-gray-500 cursor-wait text-white px-4 py-2 rounded";
    if (estadoConexion === 'desconectado') return "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition";
    if (estadoConexion === 'conectando') return "bg-yellow-600 text-white px-4 py-2 rounded cursor-wait";
    return "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition";
  };
  
  // Texto del botón según el estado
  const obtenerTextoBoton = () => {
    if (enviando) return "Enviando...";
    if (estadoConexion === 'desconectado') return "Sin conexión";
    if (estadoConexion === 'conectando') return "Conectando...";
    return "Enviar";
  };

  return (
    <div className="flex flex-col space-y-2">
      {estadoConexion === 'desconectado' && (
        <div className="text-red-600 text-xs mb-1">
          Sin conexión al servidor. Los mensajes se guardarán localmente.
        </div>
      )}
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={manejarTeclaPresionada}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder={estadoConexion === 'desconectado' ? "Sin conexión al servidor..." : "Escribe tu mensaje..."}
          disabled={inputDeshabilitado}
        />
        <button
          onClick={manejarEnvio}
          className={obtenerClaseBoton()}
          disabled={enviando || estadoConexion === 'conectando'}
        >
          {obtenerTextoBoton()}
        </button>
      </div>
    </div>
  );
};

export default EntradaMensaje; 