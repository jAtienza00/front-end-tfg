import React, { createContext, useState, useEffect, useContext } from 'react';
import ServicioSocket from 'app/services/servicioSocket';

// Definición de tipos
interface Mensaje {
  usuario: string;
  texto: string;
}

interface ContextoChatTipo {
  mensajes: Mensaje[];
  usuario: string;
  enviarMensaje: (texto: string) => void;
  setUsuario: React.Dispatch<React.SetStateAction<string>>;
  estadoConexion: 'conectado' | 'desconectado' | 'conectando';
}

interface ProveedorChatProps {
  children: React.ReactNode;
  nombreUsuarioInicial?: string;
}

// Creación del contexto
const ContextoChat = createContext<ContextoChatTipo | undefined>(undefined);

// Proveedor del contexto
export const ProveedorChat: React.FC<ProveedorChatProps> = ({ 
  children, 
  nombreUsuarioInicial 
}) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [usuario, setUsuario] = useState<string>(
    nombreUsuarioInicial || 'Usuario' + Math.floor(Math.random() * 9000 + 1000)
  );
  const [estadoConexion, setEstadoConexion] = useState<'conectado' | 'desconectado' | 'conectando'>('desconectado');
  
  // Inicializar socket al montar el componente
  useEffect(() => {
    console.log("Inicializando conexión de socket...");
    setEstadoConexion('conectando');
    
    try {
      const socket = ServicioSocket.conectar();
      
      // Manejar mensajes entrantes
      ServicioSocket.enMensajeRecibido((datos) => {
        console.log("Mensaje recibido:", datos);
        setMensajes((mensajesAnteriores) => [...mensajesAnteriores, datos]);
      });
      
      // Cargar mensajes guardados
      const mensajesGuardados = sessionStorage.getItem('mensajes_chat');
      if (mensajesGuardados) {
        try {
          const mensajesParsed = JSON.parse(mensajesGuardados);
          setMensajes(mensajesParsed);
          console.log("Mensajes cargados de sessionStorage:", mensajesParsed.length);
        } catch (error) {
          console.error("Error al parsear mensajes guardados:", error);
          sessionStorage.removeItem('mensajes_chat');
        }
      }
      
      // Manejar eventos de conexión
      socket.on('connect', () => {
        console.log("Socket conectado");
        setEstadoConexion('conectado');
      });
      
      socket.on('disconnect', () => {
        console.log("Socket desconectado");
        setEstadoConexion('desconectado');
      });
      
      socket.on('connect_error', (error) => {
        console.error("Error de conexión:", error);
        setEstadoConexion('desconectado');
      });
      
      // Guardar mensajes antes de desmontar
      const manejarAntesDescargar = () => {
        console.log("Guardando mensajes en sessionStorage:", mensajes.length);
        sessionStorage.setItem('mensajes_chat', JSON.stringify(mensajes));
      };
      
      window.addEventListener('beforeunload', manejarAntesDescargar);
      
      // Limpieza al desmontar
      return () => {
        window.removeEventListener('beforeunload', manejarAntesDescargar);
        console.log("Desconectando socket...");
        ServicioSocket.desconectar();
      };
    } catch (error) {
      console.error("Error en la inicialización del socket:", error);
      setEstadoConexion('desconectado');
    }
  }, []);
  
  // Guardar mensajes cuando cambian
  useEffect(() => {
    if (mensajes.length > 0) {
      console.log("Actualizando mensajes en sessionStorage:", mensajes.length);
      sessionStorage.setItem('mensajes_chat', JSON.stringify(mensajes));
    }
  }, [mensajes]);
  
  // Función para enviar mensaje
  const enviarMensaje = (texto: string) => {
    if (!texto.trim()) return;
    
    if (estadoConexion !== 'conectado') {
      console.warn("Intentando reconectar antes de enviar mensaje...");
      ServicioSocket.reconectar();
    }
    
    const datosMensaje = {
      usuario: usuario,
      texto: texto.trim()
    };
    
    const enviado = ServicioSocket.enviarMensaje(datosMensaje);
    
    if (enviado) {
      console.log("Mensaje enviado correctamente");
      // Añadir el mensaje a la lista local para mostrar inmediatamente
      setMensajes((mensajesAnteriores) => [...mensajesAnteriores, datosMensaje]);
    } else {
      console.error("Error al enviar el mensaje");
      // Intentar guardar el mensaje localmente de todos modos
      setMensajes((mensajesAnteriores) => [...mensajesAnteriores, {...datosMensaje, usuario: `${usuario} (sin conexión)`}]);
    }
  };
  
  // Valor del contexto que estará disponible
  const valor = {
    mensajes,
    usuario,
    enviarMensaje,
    setUsuario,
    estadoConexion
  };
  
  return (
    <ContextoChat.Provider value={valor}>
      {children}
    </ContextoChat.Provider>
  );
};

// Hook personalizado para usar el contexto
export const usarChat = () => {
  const contexto = useContext(ContextoChat);
  if (!contexto) {
    throw new Error('usarChat debe usarse dentro de un ProveedorChat');
  }
  return contexto;
};

export default ContextoChat; 