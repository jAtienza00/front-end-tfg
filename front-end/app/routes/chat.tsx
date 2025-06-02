import React, { useState, useEffect } from 'react';
import { ProveedorChat } from 'app/components/Chat/ContextoChat';
import ContenedorChat from 'app/components/Chat/ContenedorChat';
import { type MetaFunction } from 'react-router';
import { useParams } from "react-router";
import { useSearchParams } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: "Chat en tiempo real" }];
};

const LOCAL_STORAGE_USER_NAME_KEY = "nombre";
const LOCAL_STORAGE_JWT_KEY = "jwt";

export default function ChatPage() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  let [searchParams, setSearchParams] = useSearchParams();
  const [isToken, setIsToken] = useState(false);
  const { id } = useParams<{ id: string }>();
  const clave = searchParams.get('clave');

  
  // Cargar el nombre de usuario desde localStorage al montar el componente
  useEffect(() => {
    const nombreGuardado = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY) || '';
    setNombreUsuario(nombreGuardado);
    const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
    if (token) {
      setIsToken(true);
    }
  }, []);
  if (!isToken) {
    return <div className="my-[50vh] p-6 text-2xl font-bold text-center">No estás autenticado</div>;
  }
  // Pantalla de chat  
  return (
    <>
    {/*<div className='fixed right-0 p-6'>
      <button className='bg-red-600 p-4 rounded'>Eliminar</button>
    </div>*/}
    <div className="p-6">
      <ProveedorChat nombreUsuarioInicial={nombreUsuario} salaId={id!}>
        <ContenedorChat salaId={id!} clave={clave}/>
      </ProveedorChat>
    </div>
    </>
  );
}
