import { io, Socket } from 'socket.io-client';

// Abstracción para conexión y gestión WebSocket
const ServicioSocket = {
  socket: null as Socket | null,
  
  // Verificar si hay un token JWT disponible
  tieneToken: (): boolean => {
    const token = localStorage.getItem('jwt');
    return !!token;
  },
  
  // Inicializar conexión
  conectar: (urlServidor = 'http://localhost:5000') => {
    if (ServicioSocket.socket && ServicioSocket.socket.connected) {
      console.log('Ya hay una conexión activa');
      return ServicioSocket.socket;
    }
    
    // Intentar reconectar si hay una desconexión
    if (ServicioSocket.socket) {
      console.log('Reconectando socket...');
      ServicioSocket.socket.connect();
      return ServicioSocket.socket;
    }
    
    // Obtener el token JWT del almacenamiento local
    const token = localStorage.getItem('jwt');
    
    console.log('Iniciando nueva conexión a', urlServidor);
    ServicioSocket.socket = io(urlServidor, {
      withCredentials: false,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Configuración para autenticación JWT
      auth: { token },
      query: { token },
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    
    // Registrar eventos básicos
    ServicioSocket.socket.on('connect', () => {
      console.log('Conexión establecida con el servidor', ServicioSocket.socket?.id);
    });
    
    ServicioSocket.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });
    
    ServicioSocket.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor:', reason);
    });
    
    // Evento para conexión autenticada exitosamente
    ServicioSocket.socket.on('conexion_exitosa', (data) => {
      console.log('Conexión autenticada:', data);
    });
    
    return ServicioSocket.socket;
  },
  
  // Enviar mensaje
  enviarMensaje: (datos: { usuario: string; texto: string }, callback?: (confirmacion: any) => void) => {
    if (ServicioSocket.socket) {
      console.log('Enviando mensaje:', datos);
      ServicioSocket.socket.emit('enviar_mensaje', datos);
      
      // Si se proporciona un callback, registrar evento de confirmación
      if (callback) {
        ServicioSocket.socket.once('mensaje_enviado', callback);
      }
      
      return true;
    } else {
      console.error('Error: No hay conexión con el servidor');
      return false;
    }
  },
  
  // Registrar manejador de mensaje entrante
  enMensajeRecibido: (callback: (datos: any) => void) => {
    if (ServicioSocket.socket) {
      ServicioSocket.socket.on('recibir_mensaje', callback);
    } else {
      console.error('Error: No hay conexión con el servidor');
    }
  },
  
  // Registrar manejador de errores
  enError: (callback: (error: any) => void) => {
    if (ServicioSocket.socket) {
      ServicioSocket.socket.on('error', callback);
    } else {
      console.error('Error: No hay conexión con el servidor');
    }
  },
  
  // Desconectar
  desconectar: () => {
    if (ServicioSocket.socket) {
      ServicioSocket.socket.disconnect();
      return true;
    }
    return false;
  },
  
  // Reconexión después de desconexión
  reconectar: () => {
    if (ServicioSocket.socket && ServicioSocket.socket.disconnected) {
      ServicioSocket.socket.connect();
      return true;
    }
    return false;
  },
  
  // Comprobar estado de conexión
  estaConectado: () => {
    return ServicioSocket.socket?.connected || false;
  },
  
  // Actualizar token y reconectar si es necesario
  actualizarToken: () => {
    const nuevoToken = localStorage.getItem('jwt');
    
    // Si no hay socket o no hay token, no hacer nada
    if (!ServicioSocket.socket || !nuevoToken) {
      return false;
    }
    
    // Si el socket está conectado, desconectar y reconectar con el nuevo token
    if (ServicioSocket.socket.connected) {
      ServicioSocket.socket.disconnect();
      console.log('Desconectando para actualizar token');
    }
    
    // Reconectar con el nuevo token
    console.log('Reconectando con nuevo token');
    ServicioSocket.socket.auth = { token: nuevoToken };
    ServicioSocket.socket.io.opts.extraHeaders = { 
      Authorization: `Bearer ${nuevoToken}` 
    };
    ServicioSocket.socket.io.opts.query = { token: nuevoToken };
    ServicioSocket.socket.connect();
    return true;
  },
  
  // Registrar manejador para expiración de token
  enTokenExpirado: (callback: () => void) => {
    if (ServicioSocket.socket) {
      ServicioSocket.socket.on('token_expirado', callback);
    } else {
      console.error('Error: No hay conexión con el servidor');
    }
  }
};

export default ServicioSocket; 