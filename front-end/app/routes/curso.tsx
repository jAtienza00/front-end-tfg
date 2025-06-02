import React, { useState, useEffect } from "react";
import type { Route } from "./+types/curso";
import { useParams, useNavigate } from "react-router";
import Cargando from "../components/minimo/cargando";
import env from "../services/env";
import { EliminarModule } from "../components/curso/eliminarCurso";
import { ActualizarModule } from "../components/curso/actualizarCurso";
import { AniadirComentarioModule } from "../components/curso/aniadirComentario";

interface Contenido {
  id: number;
  titulo: string;
  mensaje: string | null;
  archivo: string | null;
  tipo_archivo: string | null;
  nombre_archivo_original: string | null;
  esImagen: boolean;
  url_descarga: string | null;
}
interface Cursos {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  tipo_archivo: string | null;
  color_fondo: string;
  color_texto: string;
  id_usuario: number;
}

interface responseHttp {
  curso: Cursos;
  contenido: Contenido[];
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Curso" }, { name: "description", content: "Int€rCoin!" }];
}

export default function ContenidoCursoPage() {
  const { id: cursoId } = useParams<{ id: string }>(); // Obtiene el 'id' de la URL y lo renombra a cursoId
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [contenido, setContenido] = useState<Contenido[]>([]);
  const [curso, setCurso] = useState<Cursos | null>(null); // Inicializa como null o un objeto vacío con tipo
  const [error, setError] = useState<string | null>(null);
  const [showEliminar, setEliminar] = useState(false);
  const [showActualizar, setActualizar] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showAñadir, setAniadir] = useState(false);
  const [borrar, showBorrar] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let id = localStorage.getItem("id");
    if (!id) {
      setError("Debes iniciar sesion.");
      navigate("/");
    }
    setId(id);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userIdAuth = localStorage.getItem("id"); // ID del usuario autenticado

    if (!token || !userIdAuth) {
      navigate("/"); // Redirige si no está autenticado
      return;
    }

    if (!cursoId) {
      // Verifica si cursoId (de la URL) está presente
      setError("ID del curso no especificado en la URL.");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    // Usamos cursoId (que viene de la URL) para el fetch
    fetch(env.urlPHP() + `/api/cursos/${cursoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "X-USER-ID": userIdAuth,
      },
    })
      .then((response) => {
        if (!response.ok) {
          // Intenta obtener un mensaje de error más detallado
          return response.text().then((text) => {
            let errorMsg = `Error HTTP: ${response.status} ${response.statusText}`;
            try {
              const errJson = JSON.parse(text);
              if (errJson && errJson.message) {
                errorMsg = errJson.message;
              } else if (text) {
                errorMsg = text.substring(0, 200);
              }
            } catch (e) {
              if (text) errorMsg = text.substring(0, 200);
            }
            throw new Error(errorMsg);
          });
        }
        return response.json();
      })
      .then((data: responseHttp) => {
        if (data && data.curso && data.contenido) {
          setCurso(data.curso);
          setContenido(data.contenido);
          const initialBorrarState = data.contenido.reduce(
            (acc, contentItem) => {
              acc[contentItem.id] = false;
              return acc;
            },
            {} as Record<number, boolean>
          );
          showBorrar(initialBorrarState);
        } else {
          throw new Error(
            "La respuesta de la API no tiene el formato esperado."
          );
        }
      })
      .catch((err) => {
        console.error("Error al cargar el contenido del curso:", err);
        setError(
          err.message || "Ocurrió un error al cargar los datos del curso."
        );
      })
      .finally(() => {
        setCargando(false);
      });
  }, [cursoId, navigate]); // Dependencias: cursoId (de la URL) y navigate

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Cargando />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600 p-4">
        <h2 className="text-xl font-semibold">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        <p>No se encontró información del curso.</p>
      </div>
    );
  }
  if (showAñadir) {
    return (
      <AniadirComentarioModule
        id_curso={Number(cursoId)}
        closeAniadir={setAniadir}
        color_fondo={curso.color_fondo}
        color_texto={curso.color_texto}
      />
    );
  }
  function borrarContenido(id_contenido: number) {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("jwt");
    if (!id || !token) {
      setError("Debes iniciar sesion.");
      return;
    }
    fetch(env.urlPHP() + "/api/contenido/" + cursoId + '/' + id_contenido, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
        "X-USER-ID": id,
      },
    })
      .then((response) => {
        if (response.ok) {
          setContenido((prevContenido) =>
            prevContenido.filter((item) => item.id !== id_contenido)
          );
          showBorrar((prev) => ({ ...prev, [id_contenido]: false }));
        } else {
          setError("Error al borrar el contenido.");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Renderiza la información del curso y su contenido
  return (
    <div
      className="h-full w-full p-4 items-center"
      style={{ backgroundColor: curso.color_fondo, color: curso.color_texto }}
    >
      {showEliminar && (
        <EliminarModule
          id_curso={Number(cursoId)}
          closeElimnar={setEliminar}
          nombre_curso={curso.nombre}
        />
      )}
      {showActualizar && (
        <ActualizarModule
          id_curso={Number(cursoId)}
          closeActualizar={setActualizar}
          curso={curso}
          nombre_curso={curso.nombre}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/cursos")} // Asumiendo que /cursos es la lista de cursos
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 hover:cursor-pointer"
        >
          &larr; Volver a Cursos
        </button>
        {curso.id_usuario === parseInt(id) && (
          <>
            <button
              onClick={() => setActualizar(!showActualizar)} // Asumiendo que /cursos es la lista de cursos
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 hover:cursor-pointer"
            >
              Actualizar Curso
            </button>
            <button
              onClick={() => setEliminar(!showEliminar)} // Asumiendo que /cursos es la lista de cursos
              className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 hover:cursor-pointer"
            >
              Eliminar Curso
            </button>
          </>
        )}
      </div>
      {curso.imagen && (
        <div className="w-full flex justify-center items-center">
          <img
            src={curso.imagen}
            alt={curso.nombre}
            className="w-full md:w-1/2 h-auto object-cover rounded-lg shadow-md mb-4"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2 text-center">{curso.nombre}</h1>
      <p className="text-lg m-6">{curso.descripcion}</p>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        Contenido del Curso
      </h2>
      {curso.id_usuario === parseInt(id) && (
        <div className="fixed bottom-30 right-0 mb-4 mr-4">
          <button
            className="hover:cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setAniadir(!showAñadir)}
          >
            {isHovered ? (
              <img
                src="/imagenes/comentarios-hover.png"
                className="w-15 h-15"
                alt="Añade contenido al curso"
              />
            ) : (
              <img
                src="/imagenes/comentarios.png"
                className="w-15 h-15"
                alt="Añade contenido al curso"
              />
            )}
          </button>
        </div>
      )}
      {contenido.length > 0 ? (
        <div className="w-full flex flex-col justify-center items-center">
          <ul className="space-y-4">
            {contenido.map((item) => (
              <li
                key={item.id}
                className="flex flex-row justify-between p-4 border rounded-lg shadow"
                style={{ borderColor: curso.color_texto }}
                onMouseEnter={() =>
                  showBorrar((prev) => ({ ...prev, [item.id]: true }))
                }
                onMouseLeave={() =>
                  showBorrar((prev) => ({ ...prev, [item.id]: false }))
                }
              >
                <div className="w-full">
                  <h3 className="text-xl font-semibold">{item.titulo}</h3>
                  {item.mensaje && <p className="my-1">{item.mensaje}</p>}
                  {item.tipo_archivo && item.esImagen ? (
                    <img
                      src={item.archivo}
                      alt={item.nombre_archivo_original}
                      className="w-full md:w-1/2 h-auto object-cover rounded-lg shadow-md mb-4"
                    />
                  ) : item.tipo_archivo && !item.esImagen ? (
                    <div className="flex w-full md:w-3/4 lg:w-1/2">
                      <a
                        href={item.url_descarga}
                        target="_blank"
                        className={`flex justify-center items-center p-3 ${
                          curso.color_fondo === "#000000"
                            ? "border-white"
                            : "border-black"
                        } border-2 hover:cursor-pointer w-full rounded-lg shadow-md mb-4`}
                      >
                        <img
                          src={
                            curso.color_fondo === "#000000"
                              ? "/imagenes/archivo-blanco.png"
                              : "/imagenes/archivo-negro.png"
                          }
                          alt="Icono de archivo"
                          className="w-20 h-20 object-contain rounded mr-4"
                        /> <br/>
                        <span
                          className="flex-grow"
                          style={{ color: curso.color_texto }}
                        >
                          {item.nombre_archivo_original}.{item.tipo_archivo}
                        </span>
                      </a>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div>
                  {curso.id_usuario === parseInt(id) &&(
                    <button
                      className="hover:cursor-pointer bg-red-400 rounded opacity-55"
                      style={borrar[item.id] ? {} : { display: "none" }}
                      onClick={() => {
                        borrarContenido(item.id);
                      }}
                    >
                      <img
                        src="/imagenes/borrar.png"
                        alt=""
                        className="opacity-100"
                      />
                    </button>

                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center">
          No hay contenido disponible para este curso.
        </p>
      )}
    </div>
  );
}
