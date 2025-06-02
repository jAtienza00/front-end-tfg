import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router";
import env from "../services/env";
import type { MetaFunction } from "react-router";

interface Chat {
  id: number;
  nombre: string;
  clave: string;
  max_usu: number;
  usuarios: number;
  chats_usuarios_FK: number;
}

export const meta: MetaFunction = () => {
  return [{ title: "Informacion del Chat" }];
};

export default function ActualizarChatPage() {
  const [nombre, setNombre] = useState<string>("");
  const [maxUsuarios, setMaxUsuarios] = useState<number>(100);
  const navigate = useNavigate();

  let [searchParams, setSearchParams] = useSearchParams();
  const clave = searchParams.get("clave");
  const [chat, setChat] = useState<Chat>();
  const [isCreador, setIsCreador] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    fetch(env.urlPython() + "/chats/buscar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clave: clave, id: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        data.usuarios = data.usuarios.split(";").length - 2;
        if (data.chats_usuarios_FK == id) {
          setIsCreador(true);
        }
        setChat(data);
        setNombre(data.nombre);
        setMaxUsuarios(data.max_usu);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [clave]);

  function actualizar(id_chat: number) {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    if (!token) {
      setError("Debes iniciar sesión para crear un chat.");
      return;
    }

    let trimmedNombre = nombre.trim();
    if (!trimmedNombre) {
      setError("El nombre del chat es obligatorio.");
      return;
    }
    const nombrePattern = /^[A-Za-z0-9]+$/; // Al menos un carácter alfanumérico
    if (!nombrePattern.test(trimmedNombre)) {
      setError("El nombre del chat solo puede contener letras y números.");
      return;
    }
    if (Number(maxUsuarios) <= 1) {
      // A chat should have at least 2 users
      setError("El número máximo de usuarios debe ser al menos 2.");
      return;
    }
    fetch(env.urlPython() + "/chats/actualizar/" + id_chat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: trimmedNombre,
        max_usu: maxUsuarios,
        id: id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al eliminar el chat.");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSuccessMessage(
          data.message + ": Redirigiendo al chat " + trimmedNombre
        );
        setTimeout(() => {
          navigate("/chats/" + trimmedNombre + "?clave=" + clave);
        }, 2000);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function eliminar(id_chat: number) {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    if (!token) {
      setError("Debes iniciar sesión para crear un chat.");
      return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar este chat?")) {
      fetch(env.urlPython() + "/chats/eliminar/" + id_chat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: id }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al eliminar el chat.");
          } else {
            return response.json();
          }
        })
        .then((data) => {
          setSuccessMessage(data.message + ": Redirigiendo a todos tus chats.");
          setTimeout(() => {
            navigate("/chats");
          }, 2000);
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="container flex flex-col items-center justify-center shadow-2xl rounded-2xl">
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
        {chat && (
            <div className="flex flex-col justify-center max-[600px]:items-center">
              <p className="text-2xl font-bold mb-4 capitalize text-center">Actualizar Chat {chat.nombre}</p>
              <p className="text-center mb-4 font-semibold text-gray-600">Clave del chat: {chat.clave}</p>
            <label htmlFor="nombre">Nombre:</label>
            <input
              className="border-1 rounded-md border-black"
              type="text"
              id="nombre"
              value={chat.nombre}
              onChange={(e) => {
                setChat({ ...chat, nombre: e.target.value });
                setNombre(e.target.value);
              }}
            />
            <br />
            <label htmlFor="max_usu">Maximo de usuarios:</label>
            <input
              className="border-1 rounded-md border-black"
              type="number"
              id="max_usu"
              value={chat.max_usu}
              onChange={(e) => {
                setChat({ ...chat, max_usu: parseInt(e.target.value) });
                setMaxUsuarios(parseInt(e.target.value));
              }}
            />
            <br />
            <p>
              Numero de usuarios actuales:{" "}
              <span className="font-bold text-green-600">{chat.usuarios}</span>
            </p>
            {isCreador && (
              <div className="flex justify-around lg:w-5xl">
                <button
                  onClick={() => {
                    actualizar(chat.id);
                  }}
                  className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    eliminar(chat.id);
                  }}
                  className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
