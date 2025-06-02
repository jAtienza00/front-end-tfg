import React, { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import Cargando from "../components/minimo/cargando";
import { useNavigate } from "react-router";
import env from "../services/env";

interface ChatInfo {
  nombre: string;
  id: number;
  clave: string;
}

interface ApiResponse {
  chats: ChatInfo[];
}

export const meta: MetaFunction = () => {
  return [{ title: "Vista de Chats" }];
};

export default function VistasChatsPage() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [cargando, setcargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    setcargando(true);
    setError(null);
    fetch(env.urlPython() + "/chats/cargar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        id: localStorage.getItem("id"),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // Attempt to get a more descriptive error message
          return response.text().then((text) => {
            let errorMsg = `Error HTTP: ${response.status}`;
            let errJson;
            try {
              errJson = JSON.parse(text);
              if (errJson && errJson.message) errorMsg = errJson.message;
            } catch (e) {
              /* Not a JSON error, use text if available or default */
            }
            if (!errJson.message && text) errorMsg = text.substring(0, 150); // Use part of text if no JSON message
            throw new Error(errorMsg);
          });
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        if (data && Array.isArray(data.chats)) {
          // Filter out any items that don't conform to the ChatInfo structure (e.g., missing nombre)
          const validChats = data.chats.filter(
            (chat) => typeof chat.nombre === "string"
          );
          setChats(validChats);
        } else {
          console.warn(
            "Respuesta de API inesperada o 'chats' no es un array:",
            data
          );
          setChats([]); // Set to empty if data is not as expected
          setError("Formato de respuesta de chats inesperado.");
        }
        setcargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar los chats:", err);
        setError(
          err.message ||
            "No se pudieron cargar los chats. Inténtalo de nuevo más tarde."
        );
        setcargando(false);
      });
  }, []); // Empty dependency array ensures this runs once on mount

  if (cargando) {
    return (
      <div className="flex justify-center items-center">
        <Cargando />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-4">
          Error al Cargar Chats
        </h1>
      </div>
    );
  }

  return (
    <div className="m-auto">
      <h1 className="text-3xl font-bold text-center mb-5 text-gray-800">
        Chats Disponibles
      </h1>
      <div className="flex justify-center self-center items-center space-x-4 my-4">
        <div className="bg-[#1fbd00] p-5 rounded-lg w-fit hover:cursor-pointer hover:bg-black hover:text-white transition-colors duration-300 ease-in-out" onClick={() => nav("/chat/crear")}>
          <p className="capitalize text-xl font-bold">crear chat</p>
        </div>
        <div className="bg-[#1fbd00] p-5 rounded-lg w-fit hover:cursor-pointer hover:bg-black hover:text-white transition-colors duration-300 ease-in-out" onClick={() => nav("/chat/unirse")}>
          <p className="capitalize text-xl font-bold">unirse chat</p>
        </div>
      </div>
      {chats.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No hay chats disponibles en este momento.
        </p>
      ) : (
        <ul className="space-y-4 mx-10">
          {chats.map((chat, index) => (
            <li
              key={chat.nombre + "-" + index}
              className="p-5 bg-white shadow-lg rounded-lg hover:cursor-pointer hover:shadow-xl transition-shadow duration-300 ease-in-out"
              onClick={() => nav("/chats/" + chat.nombre + '?clave=' + chat.clave)}
            >
              <h2 className="text-xl font-semibold text-blue-600">
                {chat.nombre}
              </h2>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
