import React, { useState, useEffect } from "react";
import "../App.css";
import Cargando from "../minimo/cargando";

// Definir el tipo de dato que devuelve la API
interface Cripto {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

const Inicio: React.FC = () => {
  const [data, setData] = useState<Cripto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/cripto")
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener datos");
        return response.json();
      })
      .then((data: Cripto[]) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setData([]); // Cambiado de "" a [] porque ahora data es un array
      });
  }, []);

  if (loading) return <Cargando />;

  return (
    <div className="mt-[10vh] grid grid-cols-1 justify-center sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {data.map((coin) => (
        <div
          key={coin.id}
          className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white p-4 hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-shadow duration-300"
        >
          <img className="w-full h-60 object-cover" src={coin.image} alt={coin.name} />
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800">
              {coin.name} ({coin.symbol.toUpperCase()})
            </h2>
            <p className="text-gray-600 mt-2">Precio: €{coin.current_price}</p>
            <p className="text-gray-600">Cap. de Mercado: €{coin.market_cap.toLocaleString()}</p>
            <p
              className={`mt-2 ${
                coin.price_change_percentage_24h < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              Cambio 24h: {coin.price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Inicio;