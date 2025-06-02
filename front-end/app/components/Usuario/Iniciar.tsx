import { useState } from "react";
import "../../app.css";
import env from "../../services/env";
import { useNavigate } from "react-router";

export default function Iniciar({
  closeLogin,
}: {
  closeLogin: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  async function registrarse() {
    try {
      let email = document.getElementById("email").value || "";
      let contrasenia = document.getElementById("contrasenia").value || "";
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
      const response = await fetch(
        env.urlPython() +
          "/usuarios?email=" +
          email +
          "&contrasenia=" +
          contrasenia,
        {
          method: "GET",
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
      setError("Error al iniciar sesión.");
      console.error("Error al obtener los datos:", error);
    }
  }
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50">
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-black p-6 rounded-lg shadow-black shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-white">Iniciar Sesión</h2>
        <input
          type="email"
          id="email"
          placeholder="Correo"
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
            className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-green-800"
            onClick={registrarse}
          >
            Entrar
          </button>
          <button
            className="p-2 bg-white text-green-800 rounded-lg hover:bg-green-800 hover:text-white hover:cursor-pointer hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-white"
            onClick={() => {
              closeLogin(false);
              navigate("/enter");
            }}
          >
            Registrarse
          </button>
          <button
            className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 hover:cursor-pointer"
            onClick={() => closeLogin(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
