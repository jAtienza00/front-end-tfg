import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import env from "../../services/env";

interface eliminarCursoInterface {
  id_curso: number;
  nombre_curso: string;
  closeElimnar: (value: boolean) => void;
}

export const EliminarModule: React.FC<eliminarCursoInterface> = ({
  id_curso,
  nombre_curso,
  closeElimnar,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  async function eliminarCurso() {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    if (!token || !id) {
        setError("Deberias iniciar sesion antes.");
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
    }
    await fetch(
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
    )
      .then((response) => {
        if (!response.ok) {
          setError("Error al identificarte. Inténtalo de nuevo.");
          return;
        }
      })
      .catch((error) => {
        setError("Error al identificarte. Inténtalo de nuevo.");
        return;
      });

    await fetch(env.urlPHP() + "/api/cursos/" + id_curso, {
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "X-USER-ID": id,
      },
    })
      .then((response) => {
        if (!response.ok) {
            throw new Error("Error al eliminar el curso.");
        }
        return response.json();
      }).then((data) => {
        setMessage(data.message);
        setTimeout(()=>{
            navigate("/cursos");
            closeElimnar(false);
        },2000)
        return;
        }).catch((error) => {
        setError(error.message);
        return;
      });
    }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50">
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
      <div className="bg-white text-black p-6 rounded-lg shadow-black shadow-2xl w-96">
        <h2 className="text-lg font-bold mb-4">
          Eliminar Curso: {nombre_curso}
        </h2>
        <p className="text-xs mb-4">
          Confirma que eres tu para poder eliminar el curso
        </p>
        <input
          type="email"
          id="email"
          placeholder="Correo"
          className="border p-2 w-full mb-3 rounded "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          id="contrasenia"
          placeholder="Contraseña"
          className="border p-2 w-full mb-3 rounded "
          value={contrasenia}
          onChange={(e) => setContrasenia(e.target.value)}
          required
        />
        <div className="flex justify-between">
          <button
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-800 hover:cursor-pointer "
            onClick={() => eliminarCurso()}
          >
            Eliminar
          </button>
          <button
            className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 hover:cursor-pointer"
            onClick={() => closeElimnar(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
