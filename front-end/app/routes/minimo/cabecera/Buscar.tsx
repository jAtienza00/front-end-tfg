import React, { useState, useEffect } from "react";
import "../../../app.css";
import { Link } from "react-router";

export default function Buscar() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);

  const buscar = async () => {
    if (!query) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/buscar?query=${query}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      setResultados(Array.isArray(data.coins) ? data.coins : []);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setResultados([]); // Evitar problemas si falla la API
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-row">
        <input
          id="buscar"
          className="border-none bg-white rounded-lg text-black p-2 w-full"
          placeholder="Busca tu criptomoneda"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={buscar}
          className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-black"
        >
          Buscar
        </button>
      </div>
      {query === "" ? (
        <></>
      ) : (
        <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-black p-4 rounded-lg shadow-lg">
          {resultados.map((coin) => (
            <Link to={"/cripto/" + coin.id}>
              <div
                key={coin.id}
                className="flex items-center justify-between bg-gray-900 text-white p-4 rounded-lg mb-2"
              >
                <div>
                  <h2 className="text-xl font-bold">
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </h2>
                </div>
                <img
                  className="w-16 h-16 object-cover rounded-lg"
                  src={coin.large}
                  alt={coin.name}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}