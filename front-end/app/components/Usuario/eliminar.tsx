import React, { useState, useEffect, type JSX } from "react";
import env from "../../services/env";
import { useNavigate } from "react-router";

interface Usuario {
    id: number;
    nombre: string;
    email: string;
  }
  
  interface actualizarUsuarioInterface {
    usuario: Usuario | null;
    closeEliminar: (value: boolean) => void;
  }
  
  export const EliminarModule: React.FC<actualizarUsuarioInterface> = ({
    usuario,
    closeEliminar,
  }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>(usuario?.email || "");
    const [contrasenia, setContrasenia] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
  
    function eliminarUsuario(id_usuario: number | undefined) {
        const token = localStorage.getItem("jwt");
        const id = localStorage.getItem("id")
        if (!token || !id) {
          setError("Debes iniciar sesión para eliminar tu cuenta.");
          return;
        }
        if (Number(id) != id_usuario) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("id");
          localStorage.removeItem("nombre");
          navigate("/");
          return;
        }
        if (confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) {
          fetch(env.urlPython() + "/usuarios/" + id_usuario, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: email,
              contrasenia: contrasenia
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Error al eliminar el usuario.");
              } else {
                return response.json();
              }
            })
            .then((data) => {
              localStorage.removeItem("jwt");
              localStorage.removeItem("id");
              localStorage.removeItem("nombre");
              setSuccessMessage(
                data.message + ": Redirigiendo a la pagina principal."
              );
              closeEliminar(false);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            })
            .catch((error) => {
              setError(error.message);
            });
        }
      }
  
    return (
            <div className="m-auto p-4 flex flex-col  items-center bg-green-100 border border-green-400 text-green-700 rounded-md">
              {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
      
              {successMessage && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {successMessage}
                </div>
              )}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Email:
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                  <label
                    htmlFor="contrasenia"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Contrasenia:
                  </label>
                  <input
                    type="password"
                    id="contrasenia"
                    name="contrasenia"
                    onChange={(e) => {
                      setContrasenia(e.target.value);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                  <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => {
                        eliminarUsuario(usuario?.id);
                        }}
                        className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
                    >
                        Eliminar
                    </button>
                    <button
                        onClick={() => {
                        closeEliminar(false);
                        }}
                        className=" bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
                    >
                        Cancelar
                    </button>
                  </div>
                </div>
            </div>
    );
  };
  