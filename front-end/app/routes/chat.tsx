import React, { useState, useEffect } from 'react';
import { ProveedorChat } from 'app/components/Chat/ContextoChat';
import ContenedorChat from 'app/components/Chat/ContenedorChat';
import { type MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: "Chat en tiempo real" }];
};

export default function Chat() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [isToken, setIsToken] = useState(false);
  
  // Cargar el nombre de usuario desde localStorage al montar el componente
  useEffect(() => {
    const nombreGuardado = localStorage.getItem("nombre") || '';
    setNombreUsuario(nombreGuardado);
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsToken(true);
    }
  }, []);
  if (!isToken) {
    return <div className="my-[50vh] p-6 text-2xl font-bold text-center">No estás autenticado</div>;
  }
  // Pantalla de chat  
  return (
    <div className="mt-[10vh] mb-[5vh] p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">💬 Chat en tiempo real</h2>
      <ProveedorChat nombreUsuarioInicial={nombreUsuario}>
        <ContenedorChat />
      </ProveedorChat>
    </div>
  );
}
