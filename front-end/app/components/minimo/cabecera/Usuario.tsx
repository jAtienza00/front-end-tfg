import React, { useState, useEffect } from "react";
import "../../../app.css";
import Cargando from "./../cargando";
import env from "../../../services/env";
import Nombre from "../../Usuario/Nombre";
import Iniciar from "../../Usuario/Iniciar";



export default function Usuario() {
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [data, setData] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(env.urlPython() + "/", {
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
        localStorage.removeItem("jwt");
        localStorage.removeItem("id");
        localStorage.removeItem("nombre");
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



