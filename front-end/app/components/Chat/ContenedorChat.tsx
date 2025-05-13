import React, { useEffect, useState } from 'react';
import { usarChat } from 'app/components/Chat/ContextoChat';
import ListaMensajes from 'app/components/Chat/ListaMensajes';
import EntradaMensaje from 'app/components/Chat/EntradaMensaje';

const ContenedorChat: React.FC = () => {
  const { mensajes, enviarMensaje, estadoConexion } = usarChat();
  const [usuario, setUsuario] =useState('');
  useEffect(() => {
    const usuario = localStorage.getItem("nombre")
     setUsuario(usuario || 'Usuario '  + Math.floor(Math.random() * 9000 + 1000));
  },[]);
  
  // Función para mostrar el estado de conexión con estilo adecuado
  const renderEstadoConexion = () => {
    switch (estadoConexion) {
      case 'conectado':
        return <span className="text-green-600 text-xs">●&nbsp;Conectado</span>;
      case 'conectando':
        return <span className="text-yellow-600 text-xs">●&nbsp;Conectando...</span>;
      case 'desconectado':
        return <span className="text-red-600 text-xs">●&nbsp;Desconectado</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="contenedor-chat bg-white shadow-md rounded-lg p-4 space-y-4 max-w-xl mx-auto">
      <div className="cabecera-chat border-b pb-2 mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Chat en Tiempo Real</h2>
          {renderEstadoConexion()}
        </div>
        <p className="text-sm text-gray-600">Conectado como: {usuario}</p>
      </div>
      
      <ListaMensajes mensajes={mensajes} usuarioActual={usuario} />
      <EntradaMensaje alEnviarMensaje={enviarMensaje} estadoConexion={estadoConexion} />
    </div>
  );
};

export default ContenedorChat; 