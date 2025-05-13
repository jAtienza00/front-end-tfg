import type { Route } from "./+types/cripto";
import React, { useState, useEffect } from "react";
import Cargando from "./minimo/cargando";
import { useNavigate, Link, useSearchParams } from "react-router";
import "../app.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Int€rCoin" },
    { name: "description", content: "Int€rCoin!" },
  ];
}

// Definir el tipo de dato que devuelve la API
interface Criptos {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

const Criptos: React.FC = () => {
  const [data, setData] = useState<Criptos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const paginaActual = Number(searchParams.get("pagina")) || 1;
  const cambiarPagina = (nuevaPagina: number) => {
    setSearchParams({ pagina: nuevaPagina.toString() });
  };

  const pagina = searchParams.get("pagina") || "1"; // Valor por defecto "1"

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/cripto?pagina=${pagina}`)
      .then((response) => {
        if (!response.ok) {
          console.error(`Error de respuesta: ${response.status}`);
          return response.text().then(text => {
            console.error('Contenido de respuesta:', text);
            throw new Error(`Error al obtener datos: ${response.status}`);
          });
        }
        return response.json();
      })
      .then((data: Criptos[]) => {
        console.log("Datos recibidos:", data);
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error en la petición:", error);
        setLoading(false);
        setData([]);
      });
  }, [pagina]); // Se ejecuta cuando cambia `pagina`

  if (loading) return <Cargando />;

  return (
    <>
    <div className="mt-[25vh] mb-[5vh] grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {data.map((coin, index) => (
        <div
          key={coin.id}
          className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white shadow-gray-500 p-4 hover:cursor-pointer hover:shadow-xl hover:shadow-black hover:scale-105 transition-shadow duration-500"
        >
          <Link to={"/cripto/" + coin.id}>
            <img
              className="w-full h-60 object-cover"
              src={coin.image}
              alt={coin.name}
            />
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800">
                {coin.name} ({coin.symbol.toUpperCase()})
              </h2>
              <p className="text-gray-600 mt-2">
                Precio: €{coin.current_price}
              </p>
              <p className="text-gray-600">
                Cap. de Mercado: €{coin.market_cap.toLocaleString()}
              </p>
              <p
                className={`mt-2 ${
                  coin.price_change_percentage_24h < 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                Cambio 24h: {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
      <div className=" col-span-3 flex justify-center mt-5">
        <button
          disabled={paginaActual === 1}
          onClick={() => cambiarPagina(paginaActual - 1)}
          className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-xl hover:scale-105 transition-shadow duration-300 hover:shadow-black"
        >
          Anterior
        </button>
        <span className="p-2">Página {paginaActual}</span>
        <button
          onClick={() => cambiarPagina(paginaActual + 1)}
          className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-xl hover:scale-105 transition-shadow duration-300 hover:shadow-black"
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default Criptos;
