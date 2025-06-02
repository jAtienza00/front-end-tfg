import React, { useState, useEffect, type JSX } from "react";
import env from "../../services/env";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface actualizarUsuarioInterface {
  usuario: Usuario | null;
  closeActualizar: (value: boolean) => void;
}

export const ActualizarModule: React.FC<actualizarUsuarioInterface> = ({
  usuario,
  closeActualizar,
}) => {
  const [nombre, setNombre] = useState<string>(usuario?.nombre || "");
  const [email, setEmail] = useState<string>(usuario?.email || "");
  const [mostrarEmailNuevo, setMostrarEmailNuevo] = useState<boolean>(false);
  const [emailNuevo, setEmailNuevo] = useState<string>(usuario?.email || "");
  const [contrasenia, setContrasenia] = useState<string | null>(null);
  const [mostrarContraseñaNueva, setMostrarContraseniaNueva] =
    useState<boolean>(false);
  const [contraseniaNueva, setContraseniaNueva] = useState<string | null>(null);
  const [contraseniaRepetir, setContraseniaRepetir] = useState<string | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function actualizarUsuario(id_usuario: number | undefined) {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    const data: { [key: string]: string | null | undefined } = {};
    if (!token) {
      setError("Debes iniciar sesión para crear un chat.");
      return;
    }

    if (id_usuario == undefined) {
      return;
    }
    if (id_usuario != Number(id)) {
      return;
    }

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
    data.nombre = trimmedNombre;

    if (contrasenia === "") {
      setError("La contraseña es obligatoria.");
      return;
    }
    data.contrasenia = contrasenia;

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
    data.email = email;

    if (emailNuevo !== "") {
      const trimmedEmailNuevo = emailNuevo.trim();
      if (!trimmedEmailNuevo) {
        setError("El email nuevo es obligatorio.");
        return;
      }
      const emailPatternNuevo =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPatternNuevo.test(trimmedEmailNuevo)) {
        setError("El formato del email nuevo no es válido.");
        return;
      }
      data.emailNuevo = emailNuevo;
    }
    if (contraseniaNueva !== "" && contraseniaRepetir !== "") {
      if (contraseniaNueva != contraseniaRepetir) {
        setError("Las contraseñas nuevas no coinciden.");
        return;
      }
      if (contraseniaNueva) {
        const contraseniaNuevaPattern = /^(?=(.*\d){2,}).{4,}$/;
        if (!contraseniaNuevaPattern.test(contraseniaNueva)) {
          setError(
            "La nueva contraseña debe tener al menos 4 caracteres y contener al menos dos números."
          );
          return;
        }
        data.contraseniaNueva = contraseniaNueva;
      }
    }

    if (id_usuario != undefined) {
      fetch(env.urlPython() + "/usuarios/" + id_usuario, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message || "Error al actualizar el usuario.");
            });
          } else {
            return response.json();
          }
        })
        .then((data) => {
          setSuccessMessage(
            data.message + ". Actualiza la página para ver los cambios."
          );
          if (usuario && trimmedNombre !== usuario.nombre) {
            localStorage.setItem("nombre", trimmedNombre);
          }
          setTimeout(() => {
            closeActualizar(false);
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
        <label htmlFor="nombre" className="block text-gray-700 font-bold mb-2">
          Nombre:
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          placeholder={usuario?.nombre}
          onChange={(e) => {
            setNombre(e.target.value);
          }}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
          Email:
        </label>
        <input
          type="text"
          id="email"
          name="email"
          placeholder={usuario?.email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        <div className="flex justify-center">
          <button
            onClick={() => {
              setMostrarEmailNuevo(!mostrarEmailNuevo);
            }}
            className="bg-white text-gray-700 text-xs hover:underline font-bold shadow-2xl shadow-black py-2 px-4 rounded-md hover:cursor-pointer mt-5"
          >
            Cambiar Email
          </button>
        </div>
        {mostrarEmailNuevo && (
          <>
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email Nuevo:
            </label>
            <input
              type="text"
              id="email"
              name="email"
              onChange={(e) => {
                setEmailNuevo(e.target.value);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </>
        )}
        <label
          htmlFor="contrasenia"
          className="block text-gray-700 font-bold mb-2"
        >
          Contrasenia actual:
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
        <div className="flex justify-center">
          <button
            onClick={() => {
              setMostrarContraseniaNueva(!mostrarContraseñaNueva);
            }}
            className="bg-white text-gray-700 text-xs hover:underline font-bold shadow-2xl shadow-black py-2 px-4 rounded-md hover:cursor-pointer mt-5"
          >
            Cambiar Contrasenia
          </button>
        </div>
        {mostrarContraseñaNueva && (
          <>
            <label
              htmlFor="contraseniaNueva"
              className="block text-gray-700 font-bold mb-2"
            >
              Contrasenia nueva:
            </label>
            <input
              type="password"
              id="contraseniaNueva"
              name="contraseniaNueva"
              onChange={(e) => {
                setContraseniaNueva(e.target.value);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <p className="text-red-500 text-xs italic">
              La contraseña debe tener mas de 4 caracteres y dos numeros como
              minimo.
            </p>
            <label
              htmlFor="contraseniaRepetir"
              className="block text-gray-700 font-bold mb-2"
            >
              Repetir contrasenia:
            </label>
            <input
              type="password"
              id="contraseniaRepetir"
              name="contraseniaRepetir"
              onChange={(e) => {
                setContraseniaRepetir(e.target.value);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <p className="text-red-500 text-xs italic">
              Las contraseñas deben ser iguales.
            </p>
          </>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              actualizarUsuario(usuario?.id);
            }}
            className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
          >
            Actualizar
          </button>
          <button
            onClick={() => {
              closeActualizar(false);
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
