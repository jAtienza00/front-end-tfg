# Integración de Chat WebSocket con React Router

## Estructura Conceptual para Procesamiento por IA

```
Modelo Mental:
{
  "contexto": "Integración de API de chat WebSocket en aplicación React con React Router",
  "objetivo": "Establecer comunicación bidireccional en tiempo real entre cliente React y servidor Flask WebSocket"
}
```

## 1. Componentes Fundamentales

```json
{
  "dependencias_cliente": [
    "socket.io-client",
    "react-router-dom",
    "react",
    "react-dom"
  ],
  "estructura_aplicacion": {
    "enrutamiento": "React Router gestiona navegación entre vistas",
    "estado": "Context API o Redux mantiene estado global del chat",
    "comunicacion": "Socket.io-client establece canal WebSocket persistente"
  }
}
```

## 2. Esquema de Implementación

### 2.1 Estructura de Archivos

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatContainer.jsx    # Componente principal del chat
│   │   ├── MessageList.jsx      # Lista de mensajes
│   │   ├── MessageInput.jsx     # Entrada para nuevos mensajes
│   │   └── ChatContext.jsx      # Context API para estado del chat
│   └── ... otros componentes
├── services/
│   └── socketService.js         # Servicio para gestionar conexiones WebSocket
├── routes/
│   └── AppRoutes.jsx            # Configuración de rutas con React Router
└── App.jsx                       # Componente raíz
```

### 2.2 Servicio Socket (socketService.js)

```javascript
// Abstracción para conexión y gestión WebSocket
const SocketService = {
  socket: null,
  
  // Inicializar conexión
  connect: (serverUrl = 'http://localhost:5000') => {
    const io = require('socket.io-client');
    SocketService.socket = io(serverUrl);
    
    // Registrar eventos básicos
    SocketService.socket.on('connect', () => {
      console.log('Conexión establecida con el servidor');
    });
    
    return SocketService.socket;
  },
  
  // Enviar mensaje
  sendMessage: (data) => {
    if (SocketService.socket) {
      SocketService.socket.emit('enviar_mensaje', data);
    }
  },
  
  // Registrar manejador de mensaje entrante
  onMessageReceived: (callback) => {
    if (SocketService.socket) {
      SocketService.socket.on('recibir_mensaje', callback);
    }
  },
  
  // Registrar manejador de errores
  onError: (callback) => {
    if (SocketService.socket) {
      SocketService.socket.on('error', callback);
    }
  },
  
  // Desconectar
  disconnect: () => {
    if (SocketService.socket) {
      SocketService.socket.disconnect();
    }
  }
};

export default SocketService;
```

### 2.3 Contexto de Chat (ChatContext.jsx)

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import SocketService from '../services/socketService';

// Creación del contexto
const ChatContext = createContext();

// Proveedor del contexto
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('Usuario' + Math.floor(Math.random() * 9000 + 1000));
  
  // Inicializar socket al montar el componente
  useEffect(() => {
    const socket = SocketService.connect();
    
    // Manejar mensajes entrantes
    SocketService.onMessageReceived((data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    
    // Limpieza al desmontar
    return () => {
      SocketService.disconnect();
    };
  }, []);
  
  // Función para enviar mensaje
  const sendMessage = (text) => {
    const messageData = {
      usuario: user,
      texto: text
    };
    
    SocketService.sendMessage(messageData);
  };
  
  // Valor del contexto que estará disponible
  const value = {
    messages,
    user,
    sendMessage,
    setUser
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
};

export default ChatContext;
```

### 2.4 Configuración de Rutas (AppRoutes.jsx)

```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import ChatPage from '../pages/ChatPage';
import { ChatProvider } from '../components/Chat/ChatContext';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/chat" 
        element={
          <ChatProvider>
            <ChatPage />
          </ChatProvider>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
```

### 2.5 Componente de Chat (ChatContainer.jsx)

```javascript
import React from 'react';
import { useChat } from './ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatContainer = () => {
  const { messages, sendMessage, user } = useChat();
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat en Tiempo Real</h2>
        <p>Conectado como: {user}</p>
      </div>
      
      <MessageList messages={messages} currentUser={user} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatContainer;
```

## 3. Integración con React Router

```json
{
  "proceso_integracion": [
    "Gestionar el ciclo de vida del socket según la ruta",
    "Manejar reconexiones al volver a la ruta de chat",
    "Preservar mensajes cuando se navega fuera y de vuelta"
  ],
  "consideraciones": [
    "Los sockets deben inicializarse cuando la ruta de chat está activa",
    "Implementar limpieza al navegar fuera para evitar fugas de memoria",
    "Opcionalmente, mantener conexión en segundo plano según requisitos"
  ]
}
```

### 3.1 Implementación con Router y Lazy Loading

```javascript
// App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

// Componentes cargados con lazy para optimización
const LazyChat = React.lazy(() => import('./pages/ChatPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Cargando...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

## 4. Optimizaciones y Consideraciones

```
Patrones:
1. Separación de responsabilidades: socketService gestiona comunicación
2. Context API centraliza estado del chat
3. Lazy loading optimiza carga inicial
4. Limpieza adecuada evita fugas de memoria
```

### 4.1 Reconexión después de desconexión

```javascript
// En socketService.js
reconnect: () => {
  if (SocketService.socket && SocketService.socket.disconnected) {
    SocketService.socket.connect();
    return true;
  }
  return false;
}
```

### 4.2 Persistencia de mensajes entre navegaciones

```javascript
// En ChatContext.jsx - añadir a useEffect
const handleBeforeUnload = () => {
  // Guardar mensajes en sessionStorage antes de navegar
  sessionStorage.setItem('chat_messages', JSON.stringify(messages));
};

// Registrar evento
window.addEventListener('beforeunload', handleBeforeUnload);

// Cargar mensajes al inicio
useEffect(() => {
  const savedMessages = sessionStorage.getItem('chat_messages');
  if (savedMessages) {
    setMessages(JSON.parse(savedMessages));
  }
}, []);
```

## 5. Diagrama de Flujo de Datos

```
Cliente React ←→ Socket.io-client ←→ Servidor Flask/Socket.IO
     ↑                                         ↓
Interfaz Usuario                        Broadcast a usuarios
     ↓                                         ↑
React Router                             Base de datos
(maneja navegación)                   (opcional, persistencia)
```

## 6. Métricas para Evaluación (Parámetros para IA)

```json
{
  "criterios_evaluacion": {
    "latencia": "Tiempo entre envío y recepción de mensajes",
    "estabilidad": "Tasa de reconexiones exitosas tras pérdida de conexión",
    "eficiencia_memoria": "Consumo de recursos en navegación prolongada"
  }
}
``` 