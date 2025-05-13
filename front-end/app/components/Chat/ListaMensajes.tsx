import React, { useRef, useEffect } from 'react';

interface Mensaje {
  usuario: string;
  texto: string;
}

interface PropiedadesListaMensajes {
  mensajes: Mensaje[];
  usuarioActual: string;
}

const ListaMensajes: React.FC<PropiedadesListaMensajes> = ({ mensajes, usuarioActual }) => {
  const referenciaFinal = useRef<HTMLDivElement>(null);

  // Auto-scroll al fin de los mensajes
  useEffect(() => {
    referenciaFinal.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50">
      {mensajes.map((mensaje, indice) => {
        const esUsuarioActual = mensaje.usuario === usuarioActual;
        
        return (
          <div 
            key={indice} 
            className={`mb-2 ${esUsuarioActual ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block rounded-lg px-3 py-2 max-w-3/4 ${
                esUsuarioActual 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="font-semibold text-xs mb-1">
                {esUsuarioActual ? 'Tú' : mensaje.usuario}
              </div>
              <div className="text-sm">
                {mensaje.texto}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={referenciaFinal} />
    </div>
  );
};

export default ListaMensajes; 