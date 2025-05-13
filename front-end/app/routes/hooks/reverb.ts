import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect } from 'react';

declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: typeof Pusher;
  }
}

// Hook modificado para dar soporte a la antigua implementación pero
// con compatibilidad con el nuevo sistema de chat con Socket.io
export const usarReverb = (idUsuario: string | null, token: string | null, callback: (datos: { message: string }) => void) => {
  useEffect(() => {
    // Si no hay idUsuario o token, o si está desactivado, no hacemos nada
    if (null == idUsuario || null == token) return;

    // Verificar si debemos usar la implementación antigua de Reverb
    const usarImplementacionAntigua = localStorage.getItem('usar_reverb_legacy') === 'true';
    
    if (!usarImplementacionAntigua) {
      console.log('Usando nueva implementación de chat con Socket.io. El hook usarReverb está desactivado.');
      return;
    }

    window.Pusher = Pusher;

    try {
      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: 'mzrlpi7cxaalfk8g3jtg',
        cluster: 'mt1', // ✅ necesario aunque no se use con Reverb
        wsHost: '127.0.0.1',
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        encrypted: false,
        disableStats: true,
        enabledTransports: ['ws'],
        authEndpoint: 'http://localhost:8000/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': `${idUsuario}`,
          },
        },
      });
      
      window.Echo.private(`private-messages.${idUsuario}`)
        .listen('nuevo-mensaje', callback);
    
      return () => {
        window.Echo.leave(`private-messages.${idUsuario}`);
      };
    } catch (error) {
      console.error('Error initializing Echo:', error);
    }
  }, [idUsuario, token]);
};
