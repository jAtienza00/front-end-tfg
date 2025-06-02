import React, { useState, useEffect } from "react";
import Cargando from "../components/minimo/cargando";
import { useNavigate } from "react-router";
import env from "../services/env";
import type { MetaFunction } from 'react-router';

interface Contenido {
  id: number;
  titulo: string;
  mensaje: string;
  archivo: string;
  tipo_archivo: string;
}
interface Cursos {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  tipo_archivo: string | null;
  color_fondo: string;
  color_texto: string;
}

interface responseHttp {
  curso: Cursos;
  contenido: Contenido[];
}

export const meta: MetaFunction = () => {
    return [{ title: "Todos los cursos" }];
  };

export default function CursosAllPage() {
  const [cursos, setCursos] = useState<Cursos[]>([]);
  const [errorMax, setErrorMax] = useState<string | null>(null);
  const [errorMin, setErrorMin] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const nav = useNavigate();

  useEffect(() => {
    // Use the consistent key for the authentication token
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    setCargando(true);

    // Improved check for token and id (handles null, undefined, and empty strings)
    if (!token || !id) {
      setErrorMax(
        "Debes iniciar sesión. Token o ID de usuario no encontrados."
      );
      setCargando(false); // Ensure loading state is turned off
      return;
    }

    fetch(env.urlPHP() + "/api/cursos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "X-USER-ID": id, // id is guaranteed to be a non-null, non-empty string here
      },
    })
      .then((response) => {
        if (!response.ok) {
          // Try to parse a more detailed error message from the server response
          return response.text().then((text) => {
            let errorMsg = `Error HTTP: ${response.status} ${response.statusText}`;
            try {
              const errJson = JSON.parse(text);
              if (errJson && errJson.message) {
                errorMsg = errJson.message;
              } else if (text) {
                // Use a snippet of the text if it's not JSON or has no message field
                errorMsg = text.substring(0, 200);
              }
            } catch (e) {
              // Parsing as JSON failed, use text if available
              if (text) errorMsg = text.substring(0, 200);
            }
            throw new Error(errorMsg);
          });
        }
        return response.json();
      })
      .then((data) => {
        // It's good practice to validate the structure of 'data'
        if (Array.isArray(data)) {
          setCursos(data);
        } else {
          console.warn("Respuesta de API inesperada para cursos:", data);
          setCursos([]); // Set to empty array to avoid runtime errors
          setErrorMin("Formato de respuesta de cursos inesperado.");
        }
        setCargando(false);
      })
      .catch((error) => {
        setCargando(false);
        setErrorMin(error.message || "Ocurrió un error al cargar los cursos.");
        // Optionally clear the general error if a specific fetch error occurs
        // setErrorMax(null);
      });
  }, []); // Crucial: Add empty dependency array to run effect only once on mount

  if (errorMax) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-red-600 font-bold text-2xl">{errorMax}</p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center">
        <Cargando />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-auto">
        {errorMin && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">{errorMin}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMin("")}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Cursos Disponibles
      </h1>
      {cursos.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No hay cursos disponibles en este momento.
        </p>
      ) : (
        <ul className="space-y-4 mx-10">
          {cursos.map((curso, index) => (
            <li
              key={`${curso.nombre}-${index}`}
              className={`p-5 shadow-lg shadow-[${curso.color_texto}] rounded-lg hover:cursor-pointer hover:shadow-xl transition-shadow duration-300 ease-in-out`}
              style={{ backgroundColor: curso.color_fondo }}
              onClick={() => nav(`/cursos/${curso.id}`)}
            >
              <h2
                className={`text-xl font-semibold`}
                style={{ color: curso.color_texto }}
              >
                {curso.nombre}
              </h2>
            </li>
          ))}
        </ul>
      )}
      <div>
        <button 
          onClick={() => nav("/crear-curso")}
          className="mt-10 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors hover:cursor-pointer">
            Crear curso
        </button>
      </div>
    </div>
  );
}
