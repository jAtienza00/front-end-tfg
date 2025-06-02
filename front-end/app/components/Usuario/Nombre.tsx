import React, { useState, useEffect } from "react";
import "../../app.css";
import env from "../../services/env";
import { useNavigate } from "react-router";

export default function Nombre() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [id, setId] = useState<string | null>(null);
  
    useEffect(() => {
      setId(localStorage.getItem("id"));
    }, []);
  
    useEffect(() => {
      fetch(env.urlPython() + "/usuarios/" + localStorage.getItem("id"), {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al obtener los datos del usuario");
          }
          return response.json();
        })
        .then((data) => {
          setNombre(data.nombre);
          localStorage.setItem("nombre", data.nombre);
        })
        .catch((err) => {
          console.error(err);
        });
    }, []);
  
    function cerrarSesion() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("id");
      window.location.reload();
    }
  
    return (
      <div className="relative">
        <div
          className="px-4 py-2 bg-green-800 text-white rounded-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p className="user-hover hover:cursor-pointer">{nombre}</p>
        </div>
  
        <div
          className={`absolute top-full mt-2 w-48 bg-white shadow-lg rounded-lg p-4 hover:shadow-lg shadow-black scale-105 ${
            isHovered ? "block" : "hidden"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ul className="space-y-2">
            <li
              className="text-black hover:bg-gray-100 p-2 cursor-pointer"
              onClick={() => navigate("/usuario/" + id)}
            >
              Información de Usuario
            </li>
            <li
              className="text-red-500 hover:bg-gray-100 p-2 cursor-pointer"
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </div>
    );
  }