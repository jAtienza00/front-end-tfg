import React, { useState, useEffect } from "react";
import "../../../app.css";
import Cargando from "./../cargando";

export default function Usuario() {
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [data, setData] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
  
    useEffect(() => {
      fetch("http://localhost:5000/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
        });
    }, []);
  
    if (loading) return <Cargando />;
    if (error) {
      return (
        <div>
          <button
            className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-black"
            onClick={() => setShowLogin(true)} // Abre el modal
          >
            Iniciar Sesión
          </button>
          {showLogin && <Iniciar closeLogin={() => setShowLogin(false)} />}
        </div>
      );
    }
    return <Nombre />;
  }
  
  function Nombre() {
    const [nombre, setNombre] = useState("");
    const [isHovered, setIsHovered] = useState(false);
  
    useEffect(() => {
      fetch("http://localhost:5000/usuarios/" + localStorage.getItem("id"), {
        method: "GET",
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
            <li className="text-black hover:bg-gray-100 p-2 cursor-pointer">
              Información de Usuario
            </li>
            <li className="text-red-500 hover:bg-gray-100 p-2 cursor-pointer" onClick={cerrarSesion}>
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </div>
    );
  }
  
function Iniciar({ closeLogin }: { closeLogin: (value: boolean) => void }) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50">
        <div className="bg-black p-6 rounded-lg shadow-black shadow-lg w-96">
          <h2 className="text-lg font-bold mb-4 text-white">Iniciar Sesión</h2>
          <input
            type="text"
            id="nombre"
            placeholder="Usuario"
            className="border p-2 w-full mb-3 rounded text-white"
          />
          <input
            type="password"
            id="contrasenia"
            placeholder="Contraseña"
            className="border p-2 w-full mb-3 rounded text-white"
          />
          <div className="flex justify-between">
            <button
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={registrarse}
            >
              Entrar
            </button>
            <button
              className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
              onClick={() => closeLogin(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  async function registrarse() {
    try {
      const response = await fetch(
        "http://localhost:5000/usuarios?nombre=" +
          document.getElementById("nombre").value +
          "&contrasenia=" +
          document.getElementById("contrasenia").value,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
      const data = await response.json();
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("id", data.id);
      window.location.reload();
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
  

  function cerrarSesion() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("id");
    window.location.reload();
  }
  
  
