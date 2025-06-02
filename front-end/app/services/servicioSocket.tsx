import { io, Socket } from 'socket.io-client';
import env from './env';


// Abstracción para conexión y gestión WebSocket
const ServicioSocket = {
  socket: null as Socket | null,
  currentRoom: null as string | null, // Para rastrear la sala actual

  // Verificar si hay un token JWT disponible
  tieneToken: (): boolean => {
    const token = localStorage.getItem('jwt');
    return !!token;
  },
  
  // Inicializar conexión
  conectar: (room = 'global', urlServidor = env.urlPython()) => {
    // Si ya estamos conectados a la sala deseada, no hacer nada.
    if (ServicioSocket.socket?.connected && ServicioSocket.currentRoom === room) {
      console.log(`Socket ya conectado a la sala: ${room}`);
      return ServicioSocket.socket;
    }

    // Si estamos conectados pero a una sala diferente, o simplemente queremos (re)unirnos.
    if (ServicioSocket.socket?.connected && ServicioSocket.currentRoom !== room) {
      console.log(`Socket conectado. Cambiando de sala ${ServicioSocket.currentRoom} a ${room}`);
      ServicioSocket.unirseSala(room); // Se une a la nueva y actualiza currentRoom
      return ServicioSocket.socket;
    }

    // Si el socket existe pero está desconectado, intentar reconectar.
    if (ServicioSocket.socket?.disconnected) {
      console.log('Socket existente desconectado. Estableciendo currentRoom y reconectando...');
      ServicioSocket.currentRoom = room; // Asegurar que currentRoom es la sala deseada antes de reconectar
      ServicioSocket.socket.connect();
      return ServicioSocket.socket;
    }

    // Obtener el token JWT del almacenamiento local
    const token = localStorage.getItem('jwt');

    console.log(`Iniciando nueva conexión a ${urlServidor} para la sala: ${room}`);
    ServicioSocket.currentRoom = room; // Establecer la sala deseada para la nueva conexión
    ServicioSocket.socket = io(urlServidor, {
      withCredentials: false,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Configuración para autenticación JWT
      auth: { token: token }, // Asegurarse que el token se pasa correctamente
      query: { token, room },
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });

    // Registrar eventos básicos
    ServicioSocket.socket.on('connect', () => {
      console.log(`[ServicioSocket] Conexión establecida. ID: ${ServicioSocket.socket?.id}. CurrentRoom: ${ServicioSocket.currentRoom}`);
      // Al conectar (o reconectar), unirse a la sala actual almacenada.
      if (ServicioSocket.currentRoom && ServicioSocket.socket) {
        console.log(`Uniéndose a la sala: ${ServicioSocket.currentRoom} tras (re)conexión.`);
        ServicioSocket.socket.emit('join_room', { room: ServicioSocket.currentRoom });
      }
    });

    ServicioSocket.socket.on('connect_error', (error) => {
      console.error('[ServicioSocket] Error de conexión:', error);
    });

    ServicioSocket.socket.on('disconnect', (reason) => {
      console.log(`[ServicioSocket] Desconectado del servidor. Razón: ${reason}. Socket ID era: ${ServicioSocket.socket?.id}`);
    });

    // Evento para conexión autenticada exitosamente
    ServicioSocket.socket.on('conexion_exitosa', (data) => {
      console.log('Conexión autenticada:', data);
    });

    return ServicioSocket.socket;
  },

  // Enviar mensaje
  enviarMensaje: (datos: { usuario: string; texto: string ; room: string; }, callback?: (confirmacion: any) => void) => {
    if (ServicioSocket.socket) {
      console.log('[ServicioSocket] Enviando mensaje:', datos, 'a la sala:', datos.room);
      ServicioSocket.socket.emit('enviar_mensaje', datos);
      
      // Si se proporciona un callback, registrar evento de confirmación
      if (callback) {
        ServicioSocket.socket.once('mensaje_enviado', callback);
      }

      return true;
    } else {
      console.error('[ServicioSocket] Error al enviar mensaje: No hay conexión con el servidor');
      return false;
    }
  },

  unirseSala: (room: string) => {
    if (ServicioSocket.socket && ServicioSocket.socket.connected) {
        // Opcional: Si se está en otra sala, emitir 'leave_room' para la anterior
        // if (ServicioSocket.currentRoom && ServicioSocket.currentRoom !== roomId) {
        //   ServicioSocket.socket.emit('leave_room', { room: ServicioSocket.currentRoom });
        // }
        console.log(`[ServicioSocket] Emitiendo 'join_room' para la sala: ${room}`);
        ServicioSocket.socket.emit('join_room', { room: room });
        ServicioSocket.currentRoom = room; // Actualizar la sala actual
    } else {
        console.error('[ServicioSocket] Error al unirse a sala: No hay conexión con el servidor');
    }
  },

  // Registrar manejador de mensaje entrante
  // Devuelve una función para desuscribirse
  enMensajeRecibido: (room: string, callback: (datos: any) => void): (() => void) => {
    if (!ServicioSocket.socket) {
      console.error(`[ServicioSocket] enMensajeRecibido: No hay socket para suscribir a la sala '${room}'.`);
      return () => {}; // Devuelve una función no-op si no hay socket
    }
    if (!ServicioSocket.socket.connected) {
      console.warn(`[ServicioSocket] enMensajeRecibido: Socket no conectado al intentar suscribir a la sala '${room}'. Socket ID: ${ServicioSocket.socket.id}`);
    }

    console.log(`[ServicioSocket] Registrando listener 'recibir_mensaje' para la sala: '${room}'. Socket ID: ${ServicioSocket.socket.id}`);

    const handler = (data: any) => {
      console.log(`[ServicioSocket] Evento 'recibir_mensaje' CAPTURADO. Data:`, data, `Listener para sala: '${room}'. Socket ID: ${ServicioSocket.socket?.id}`);
      // Asumimos que el backend envía el mensaje con una propiedad 'room'
      // que indica a qué sala pertenece el mensaje.
      if (ServicioSocket.currentRoom === room) {
        console.log(`[ServicioSocket] Mensaje COINCIDE con la sala '${room}'. Ejecutando callback.`);
        callback(data);
      } else {
          console.warn(`[ServicioSocket] Mensaje para sala '${data.room}' IGNORADO por listener de sala '${room}'.`);
      }
    };

    ServicioSocket.socket.on('recibir_mensaje', handler);
    console.log(`[ServicioSocket] Listener para 'recibir_mensaje' (sala '${room}') AÑADIDO.`);

    // Devuelve una función para remover este listener específico
    return () => {
      ServicioSocket.socket?.off('recibir_mensaje', handler); // Usar el mismo socket para off
      console.log(`[ServicioSocket] Listener para 'recibir_mensaje' (sala '${room}') ELIMINADO.`);
    };
  },

  // Registrar manejador de errores
  enError: (callback: (error: any) => void) => {
    if (ServicioSocket.socket) {
      ServicioSocket.socket.on('error', callback);
    } else {
      console.error('[ServicioSocket] enError: No hay conexión con el servidor');
    }
  },

  // Desconectar
  desconectar: () => {
    if (ServicioSocket.socket) {
      // Opcional: emitir 'leave_room' si el backend lo requiere al desconectar explícitamente
      // if (ServicioSocket.currentRoom) {
      //   ServicioSocket.socket.emit('leave_room', { room: ServicioSocket.currentRoom });
      // }
      ServicioSocket.socket.disconnect();
      // ServicioSocket.currentRoom = null; // Opcional: limpiar la sala actual
      return true;
    }
    return false;
  },

  // Reconexión después de desconexión
  reconectar: (room?: string) => { // roomId es opcional, si no se provee, usa currentRoom
    if (ServicioSocket.socket?.disconnected) {
      console.log(`[ServicioSocket] Reconectando socket... Socket ID era: ${ServicioSocket.socket.id}`);
      if (room) {
          ServicioSocket.currentRoom = room; // Actualizar si se provee una nueva sala
      }
      // La lógica en 'connect' se encargará de unirse a ServicioSocket.currentRoom
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

    // Actualizar las credenciales del socket.
    // Socket.IO v3/v4 permite actualizar auth en tiempo real si el socket está desconectado.
    // Si está conectado, es mejor desconectar, actualizar auth y reconectar.
    const needsReconnect = ServicioSocket.socket.connected;
    if (needsReconnect) {
        ServicioSocket.socket.disconnect();
    }

    console.log('[ServicioSocket] Actualizando token y reconectando...');
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
      console.error('[ServicioSocket] enTokenExpirado: No hay conexión con el servidor');
    }
  }
};

export default ServicioSocket; 