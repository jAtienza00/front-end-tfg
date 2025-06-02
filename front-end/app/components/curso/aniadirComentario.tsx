import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import env from "../../services/env";

interface aniadirComentarioInterface {
  id_curso: number;
  color_fondo: string;
  color_texto: string;
  closeAniadir: (value: boolean) => void;
}

export const AniadirComentarioModule: React.FC<aniadirComentarioInterface> = ({
  id_curso,
  color_fondo,
  color_texto,
  closeAniadir,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const maxCaracteres = 1000;
  const [titulo, setTitulo] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  function subirContenido() {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("jwt");
    setError(null);
    setMessage(null);

    if (!id || !token) {
      setError("Debes iniciar sesion.");
      return;
    }

    const formData = new FormData();
    if (titulo.length === 0) {
      setError("El titulo es obligatorio.");
      return;
    }
    formData.append("titulo", titulo);

    if (mensaje.length !== 0) {
      formData.append("mensaje", mensaje);
    }

    if (archivo) {
      formData.append("archivo", archivo);
    }

    fetch(env.urlPHP() + "/api/contenido/" + id_curso, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "X-USER-ID": id,
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setMessage("Contenido subido correctamente.");
          setTimeout(() => {
            closeAniadir(false);
            window.location.reload();
          }, 2000)
        } else {
          setError("Error al subir el contenido.");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div
      className="h-full w-full p-4 items-center mb-4"
      style={{ backgroundColor: color_fondo, color: color_texto }}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {message}
        </div>
      )}

        <button 
        className="fixed right-0 hover:cursor-pointer"
        onClick={() => closeAniadir(false)}>
            <img src="/imagenes/cerrar.png" alt="cerrar" className="w-12 h-12" />
        </button>
      <div className="m-10">
        <label
          htmlFor="titulo"
          className="block text-sm font-medium"
          style={{ color: color_texto }}
        >
          Titulo del comentario: *
        </label>
        <input
          type="text"
          id="titulo"
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          style={{ color: color_texto }}
          placeholder="Ej: Que a gusto estoy..."
          required
        />
      </div>

      <div className="m-10">
        <label
          htmlFor="mensaje"
          className="block text-sm font-medium"
          style={{ color: color_texto }}
        >
          Mensaje:
        </label>
        <textarea
          id="mensaje"
          onChange={(e) => {
            if (e.target.value.length <= maxCaracteres) {
              setMensaje(e.target.value);
            } else {
              window.document.getElementById("mensaje").value = mensaje;
            }
          }}
          className="mt-1 block w-full h-60 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          style={{ color: color_texto }}
          placeholder="Ej: Me encanta esta web!!"
        />
      </div>

      <div className="m-10">
        <label
          htmlFor="archivo"
          className="block text-sm font-medium"
          style={{ color: color_texto }}
        >
          Archivo:
        </label>
        <input
          type="file"
          id="archivo"
          onChange={(e) =>
            setArchivo(e.target.files ? e.target.files[0] : null)
          }
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          style={{ color: color_texto }}
        />
      <p className="text-red-500 text-xs italic">
        Los campos con * son obligatorios.
      </p>
      </div>
      <div className="m-10 flex justify-center"
      
      >
        <button
          className="w-56 h-10 hover:cursor-pointer rounded-xl"
          style={isHovered ? { backgroundColor: color_fondo, color: color_texto} : {backgroundColor: color_texto, color: color_fondo}}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => subirContenido()}
        >
          Subir contenido
        </button>
      </div>
    </div>
  );
};
