import React, { useState, useEffect, type JSX } from "react";
import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";
import Cargando from "../components/minimo/cargando";
import env from "../services/env";
import {ActualizarModule} from "../components/Usuario/actualizar";
import {EliminarModule} from "../components/Usuario/eliminar";


interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export const meta: MetaFunction = () => {
  return [{ title: "Informacion de Usuario" }];
};

export default function PerfilPage(): JSX.Element {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [actualizar, setActualizar] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [eliminar, setEliminar] = useState<boolean>(false);

  useEffect(() => {
    let id = localStorage.getItem("id");
    let token = localStorage.getItem("jwt");
    if (!id || !token) {
      navigate("/");
      return;
    }
    setId(Number(id));
    setToken(token);
  }, []);

  useEffect(() => {
    if (!id || !token) return;
    fetch(env.urlPython() + "/usuarios/" + id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUsuario(data);
        setNombre(data.nombre);
        setEmail(data.email);
        setCargando(false);
      })
      .catch((error) => {
        setError("Error al obtener los datos del usuario.");
        setCargando(false);
      });
  }, [id, token]);
  

  
  if (cargando) {
    return (
      <div className="flex justify-center items-center">
        <Cargando />
      </div>
    );
  }

  if (actualizar) {
    return (
      <ActualizarModule
        usuario={usuario}
        closeActualizar={setActualizar}
      />
    );
  }

  if (eliminar) {
    return (
      <EliminarModule 
        usuario={usuario}
        closeEliminar={setEliminar}
      />
    );
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
      <p>Hola {usuario?.nombre}</p>
      <p>Email: {usuario?.email}</p>
      <p>ID: {usuario?.id}</p>
      <div className="flex justify-around lg:w-5xl">
        <button
          onClick={() => {
            setActualizar(!actualizar);
          }}
          className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
        >
          Actualizar
        </button>
        <button
          onClick={() => {
            setEliminar(!eliminar);
          }}
          className=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:cursor-pointer mt-5"
        >
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
}
