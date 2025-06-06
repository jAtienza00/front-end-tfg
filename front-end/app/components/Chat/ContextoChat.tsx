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
  salaId: string; // ID de la sala a la que conectarse
}

// Creación del contexto
const ContextoChat = createContext<ContextoChatTipo | undefined>(undefined);

// Proveedor del contexto
export const ProveedorChat: React.FC<ProveedorChatProps> = ({
  children,
  nombreUsuarioInicial,
  salaId // Recibe salaId como prop
}) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [usuario, setUsuario] = useState<string>(
    nombreUsuarioInicial || 'Usuario' + Math.floor(Math.random() * 9000 + 1000)
  );
  const [estadoConexion, setEstadoConexion] = useState<'conectado' | 'desconectado' | 'conectando'>('desconectado');
  
  // Inicializar socket al montar el componente
  useEffect(() => {
    if (!salaId) {
      console.warn("salaId no proporcionado a ProveedorChat. No se conectará el socket.");
      setEstadoConexion('desconectado');
      return;
    }
    console.log(`Inicializando conexión de socket para la sala: ${salaId}...`);
    setEstadoConexion('conectando');
    
    try {
      // Asumimos que ServicioSocket.conectar ahora toma salaId
      // o tienes un método como ServicioSocket.unirseASala(salaId) después de conectar.
      const socket = ServicioSocket.conectar(salaId); 
      
      // Manejar mensajes entrantes
      ServicioSocket.enMensajeRecibido( salaId, (datos) => {
        console.log(`Mensaje recibido para la sala ${salaId}:`, datos);
        setMensajes((mensajesAnteriores) => [...mensajesAnteriores, datos]);
      });
      
      // Cargar mensajes guardados
      const storageKey = `mensajes_chat_${salaId}`;
      const mensajesGuardados = sessionStorage.getItem(storageKey);
      if (mensajesGuardados) {
        try {
          const mensajesParsed = JSON.parse(mensajesGuardados);
          setMensajes(mensajesParsed);
          console.log(`Mensajes cargados de sessionStorage para la sala ${salaId}:`, mensajesParsed.length);
        } catch (error) {
          console.error(`Error al parsear mensajes guardados para la sala ${salaId}:`, error);
          sessionStorage.removeItem(storageKey); // Limpiar si hay error
        }
      }
      
      // Manejar eventos de conexión
      socket.on('connect', () => {
        console.log("Socket conectado");
        setEstadoConexion('conectado');
      });
      
      socket.on('disconnect', (reason) => {
        console.log(`Socket desconectado de la sala ${salaId}:`, reason);
        setEstadoConexion('desconectado');
      });
      
      socket.on('connect_error', (error) => {
        console.error(`Error de conexión para la sala ${salaId}:`, error);
        setEstadoConexion('desconectado');
      });
      
      // Guardar mensajes antes de desmontar
      const manejarAntesDescargar = () => {
        console.log(`Guardando mensajes en sessionStorage para la sala ${salaId} (${mensajes.length} mensajes)...`);
        sessionStorage.setItem(storageKey, JSON.stringify(mensajes));
      };
      
      window.addEventListener('beforeunload', manejarAntesDescargar);
      
      // Limpieza al desmontar
      return () => {
        window.removeEventListener('beforeunload', manejarAntesDescargar);
        console.log(`Desconectando socket de la sala ${salaId}...`);
        ServicioSocket.desconectar();
        setMensajes([]); // Opcional: limpiar mensajes al cambiar de sala
      };
    } catch (error) {
      console.error(`Error en la inicialización del socket para la sala ${salaId}:`, error);
      setEstadoConexion('desconectado');
    }
  }, [salaId]); // El efecto se re-ejecuta si salaId cambia
  
  // Guardar mensajes cuando cambian
  useEffect(() => {
    if (salaId && mensajes.length > 0) { // Asegurarse que salaId existe
      const storageKey = `mensajes_chat_${salaId}`;
      console.log(`Actualizando mensajes en sessionStorage para la sala ${salaId} (${mensajes.length} mensajes)...`);
      sessionStorage.setItem(storageKey, JSON.stringify(mensajes));
    }
  }, [mensajes, salaId]); // Depende de mensajes y salaId
  
  // Función para enviar mensaje
  const enviarMensaje = (texto: string) => {
    if (!texto.trim()) return;
    
    if (estadoConexion !== 'conectado') {
      console.warn("Intentando reconectar antes de enviar mensaje...");
      // Reconectar podría necesitar salaId si la conexión se perdió y debe re-unirse a la sala
      ServicioSocket.reconectar(salaId); // Asumiendo que reconectar también puede tomar salaId
    }
    
    const datosMensaje = {
      usuario: usuario,
      texto: texto.trim(),
      room: salaId // El servicio de socket se encargará de la sala actual
    };
    
    // Aseguramos que se envíe 'room' como espera el servidor
    const enviado = ServicioSocket.enviarMensaje({ ...datosMensaje});
    if (enviado) {
      console.log("Mensaje enviado correctamente");
      //setMensajes((mensajesAnteriores) => [...mensajesAnteriores, datosMensaje]);
    } else {
      console.error("Error al enviar el mensaje");
      //setMensajes((mensajesAnteriores) => [...mensajesAnteriores, {...datosMensaje, usuario: `${usuario} (sin conexión)`}]);
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
