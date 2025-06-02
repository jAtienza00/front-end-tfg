import React, { useEffect, useState } from "react";
import Cargando from "../components/minimo/cargando";
import env from "../services/env";
import { useNavigate, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Registrate" }];
};

export default function enterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contrasenia, setContrasenia] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      navigate("/");
    }
  }, []);

  function registrarse() {
    let trimmedNombre = nombre.trim();
    if (!trimmedNombre) {
      setError("El nombre es obligatorio.");
      return;
    }
    const nombrePattern = /^[A-Za-z0-9]+$/;
    if (!nombrePattern.test(trimmedNombre)) {
      setError("El nombre de usuario solo puede contener letras y números.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("El email es obligatorio.");
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("El formato del email no es válido.");
      return;
    }

    // Password should be mandatory for registration
    if (!contrasenia) {
      setError("La contraseña es obligatoria.");
      return;
    } else {
      const contraseniaNuevaPattern = /^(?=(.*\d){2,}).{4,}$/;
      if (!contraseniaNuevaPattern.test(contrasenia)) {
        setError(
          "La nueva contraseña debe tener al menos 4 caracteres y contener al menos dos números."
        );
        return;
      }
    }

    setCargando(true);
    setError(undefined); // Clear previous errors

    fetch(env.urlPython() + "/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization header is usually not needed for registration
        // Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        nombre: trimmedNombre,
        email: trimmedEmail,
        contrasenia: contrasenia,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // Try to parse error message from backend if available
          return response
            .json()
            .then((errData) => {
              throw new Error(
                errData.message ||
                  response.statusText ||
                  "Error en el registro."
              );
            })
            .catch(() => {
              // Fallback if parsing error response fails
              throw new Error(response.statusText || "Error en el registro.");
            });
        }
        return response.json();
      })
      .then((data) => {
        setCargando(false);
        // Handle successful registration, e.g., navigate to login or a success page
        setMessage(data.message);
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("id", data.id);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((error) => {
        setCargando(false);
        setError(error.message);
        // Clearing localStorage items might not be relevant here unless they were set prematurely
      });
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center">
        <Cargando />
      </div>
    );
  }
  return (
    <div className="mb-4 p-4 flex flex-row justify-around  items-center bg-green-100 border border-green-400 text-green-700 rounded-md">
      <img
        src="/imagenes/intercoin.png"
        alt="icono"
        className="lg:block md:block sm:hidden max-sm:hidden"
      />
      <div className="mb-4 p-4 flex flex-col space-y-4 ">
        {error && (
          <div className="text-red-500 p-2 my-2 border border-red-500 rounded">
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <p>{message}</p>
          </div>
        )}
        <div className="flex flex-col">
          <label htmlFor="nombre">Introduce el nombre de usuario:</label>
          <input
            className="border-1 rounded-md border-black"
            type="text"
            placeholder="Nombre"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">Introduce el email:</label>
          <input
            className="border-1 rounded-md border-black"
            type="email"
            placeholder="Email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Introduce la contraseña:</label>
          <input
            className="border-1 rounded-md border-black"
            type="password"
            placeholder="Contraseña"
            id="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
        </div>
        <button
          className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-black"
          onClick={() => registrarse()}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
