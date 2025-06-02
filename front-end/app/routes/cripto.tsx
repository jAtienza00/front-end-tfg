import type { Route } from "./+types/cripto";
import React, { useState, useEffect } from "react";
import "../app.css";
import Cargando from "../components/minimo/cargando";
import { useParams } from "react-router";
import env from "../services/env";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Int€rCoin" },
    { name: "description", content: "Int€rCoin!" },
  ];
}

// Definir el tipo de dato que devuelve la API
interface Cripto {
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  description: {
    en: string;
  };
  links: {
    subreddit_url: string;
    homepage: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: {
      usd: number;
      eur: number;
    };
    fully_diluted_valuation: {
      usd: number;
      eur: number;
    };
    priceChange24h: number;
    high_24h: {
      usd: number;
      eur: number;
    };
    low_24h: {
      usd: number;
      eur: number;
    };
    price_change_percentage_24h_in_currency: {
      usd: number;
      eur: number;
    };
    price_change_percentage_7d_in_currency: {
      usd: number;
      eur: number;
    };
    price_change_percentage_30d_in_currency: {
      usd: number;
      eur: number;
    };
    price_change_percentage_60d_in_currency: {
      usd: number;
      eur: number;
    };
    price_change_percentage_200d_in_currency: {
      usd: number;
      eur: number;
    };
    price_change_percentage_1y_in_currency: {
      usd: number;
      eur: number;
    };
  };
  marketCapEUR: number;
  marketCapUSD: number;
}

const Cripto: React.FC = () => {
  const [coin, setCoin] = useState<Cripto | null>(null); // Ahora es un objeto, no un array
  const [loading, setLoading] = useState<boolean>(true);
  const [cantidad, setCantidad] = useState<number>(1);
  const [moneda, setMoneda] = useState<string>("eur");
  const { id } = useParams<{ id: string }>(); // Asegura que `id` es string
  const arrayMonedas = [
    "btc",
    "eth",
    "ltc",
    "bch",
    "bnb",
    "eos",
    "xrp",
    "xlm",
    "link",
    "dot",
    "yfi",
    "usd",
    "aed",
    "ars",
    "aud",
    "bdt",
    "bhd",
    "bmd",
    "brl",
    "cad",
    "chf",
    "clp",
    "cny",
    "czk",
    "dkk",
    "eur",
    "gbp",
    "gel",
    "hkd",
    "huf",
    "idr",
    "ils",
    "inr",
    "jpy",
    "krw",
    "kwd",
    "lkr",
    "mmk",
    "mxn",
    "myr",
    "ngn",
    "nok",
    "nzd",
    "php",
    "pkr",
    "pln",
    "rub",
    "sar",
    "sek",
    "sgd",
    "thb",
    "try",
    "twd",
    "uah",
    "vef",
    "vnd",
    "zar",
    "xdr",
    "xag",
    "xau",
    "bits",
    "sats",
  ];

  useEffect(() => {
    if (!id) return; // Evita ejecutar la petición si `id` es undefined

    fetch(env.urlPHP() + `/api/cripto/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener datos");
        return response.json();
      })
      .then((data: Cripto) => {
        // Ahora espera un solo objeto, no un array
        setCoin(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setCoin(null); // Cambiado a null para indicar que no hay datos
      });
  }, [id]); // Se actualiza si `id` cambia

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <Cargando />
      </div>
    );
  if (!coin)
    return (
      <p className="text-center text-red-500">Criptomoneda no encontrada</p>
    );

    const formatNumberWithSpaces = (num: number): string => {
      if (isNaN(num) || !isFinite(num)) {
        return String(num); // Devuelve "NaN" o "Infinity" como string
      }
      const parts = num.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join('.');
    };

  return (
    <div className="p-6 mt-[20vh] bg-white mx-auto">
      <div className="flex items-center justify-center space-x-4">
        <img
          src={coin.image.large}
          alt={coin.name}
          className="w-50 h-50 mr-5"
        />
        <div className="ml-5">
          <h2 className="text-xl font-bold">
            {coin.name} ({coin.symbol.toUpperCase()})
          </h2>
          <p className="text-gray-500">
            Ranked de mercado: #{coin.market_cap_rank}
          </p>
          <p className="text-blue-400 hover:underline">
            <a href={coin.links.homepage}>Pagina principal</a>
          </p>
          <p className="text-blue-400 hover:underline">
            <a href={coin.links.subreddit_url}>Reddit</a>
          </p>
        </div>
      </div>
      <p className="m-5 text-md text-gray-700">
        {coin.description.en.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <div className="w-full p-4 border rounded-lg shadow-md flex flex-row justify-around">
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold">Precio:</p>
          <p>💶 {formatNumberWithSpaces(coin.market_data.current_price.eur)} EUR</p>
          <p>💵 {formatNumberWithSpaces(coin.market_data.current_price.usd)} USD</p>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold">
            Valoración totalmente diluida:
          </p>
          <p>💶 {formatNumberWithSpaces(coin.market_data.fully_diluted_valuation.eur)} EUR</p>
          <p>💵 {formatNumberWithSpaces(coin.market_data.fully_diluted_valuation.usd)} USD</p>
        </div>
      </div>
      <div className="mt-4 w-full p-4 border rounded-lg shadow-md flex flex-row justify-around">
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold">
            Valoración en {coin.symbol.toUpperCase()}:
          </p>
          {cantidad && (
            <p>
              <input
              type="number"
              id="cantidad"
              name="cantidad"
              step="1"
              className="border-2 rounded"
              value={cantidad}
              onChange={(e) => {
                setCantidad(e.target.value);
              }}
              min="1"
            /> {coin.symbol.toUpperCase()} ={" "}
              {formatNumberWithSpaces(cantidad * coin.market_data.current_price[moneda])}{" "}
              <select
              name="moneda"
              id="moneda"
              className="border-2 rounded"
              onChange={(e) => {
                setMoneda(e.target.value);
              }}
              value={moneda}
            >
              {arrayMonedas.map((moneda) => (
                <option value={moneda} key={moneda}>
                  {moneda.toUpperCase()}
                </option>
              ))}
            </select>
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-full p-4 border rounded-lg shadow-md">
          <div className="mt-2 flex flex-row justify-around">
            <div>
              <p className="text-lg font-semibold">Max. 24h:</p>
              <p>💶 {formatNumberWithSpaces(coin.market_data.high_24h.eur)} EUR</p>
              <p>💵 {formatNumberWithSpaces(coin.market_data.high_24h.usd)} USD</p>
            </div>
            <div>
              <p className="text-lg font-semibold">Min. 24h:</p>
              <p>💶 {formatNumberWithSpaces(coin.market_data.low_24h.eur)} EUR</p>
              <p>💵 {formatNumberWithSpaces(coin.market_data.low_24h.usd)} USD</p>
            </div>
          </div>
          <p
            className={`mt-4 font-bold text-lg text-center ${
              coin.market_data.price_change_percentage_24h_in_currency.eur >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Cambio 24h:{" "}
            {coin.market_data.price_change_percentage_24h_in_currency.eur}%
            (EUR)
          </p>
          <p
            className={`mt-2 font-bold text-lg text-center ${
              coin.market_data.price_change_percentage_24h_in_currency.usd >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Cambio 24h:{" "}
            {coin.market_data.price_change_percentage_24h_in_currency.usd}%
            (USD)
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg shadow-md">
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_7d_in_currency.eur >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 7d:{" "}
              {coin.market_data.price_change_percentage_7d_in_currency.eur}%
              (EUR)
            </p>
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_7d_in_currency.usd >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 7d:{" "}
              {coin.market_data.price_change_percentage_7d_in_currency.usd}%
              (USD)
            </p>
          </div>

          <div className="p-4 border rounded-lg shadow-md">
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_30d_in_currency.eur >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 30d:{" "}
              {coin.market_data.price_change_percentage_30d_in_currency.eur}%
              (EUR)
            </p>
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_30d_in_currency.usd >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 30d:{" "}
              {coin.market_data.price_change_percentage_30d_in_currency.usd}%
              (USD)
            </p>
          </div>
          <div className="p-4 border rounded-lg shadow-md">
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_60d_in_currency.eur >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 60d:{" "}
              {coin.market_data.price_change_percentage_60d_in_currency.eur}%
              (EUR)
            </p>
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_60d_in_currency.usd >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 60d:{" "}
              {coin.market_data.price_change_percentage_60d_in_currency.usd}%
              (USD)
            </p>
          </div>
          <div className="p-4 border rounded-lg shadow-md">
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_200d_in_currency.eur >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 200d:{" "}
              {coin.market_data.price_change_percentage_200d_in_currency.eur}%
              (EUR)
            </p>
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_200d_in_currency.usd >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 200d:{" "}
              {coin.market_data.price_change_percentage_200d_in_currency.usd}%
              (USD)
            </p>
          </div>
          <div className="p-4 border rounded-lg shadow-md">
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_1y_in_currency.eur >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 1 año:{" "}
              {coin.market_data.price_change_percentage_1y_in_currency.eur}%
              (EUR)
            </p>
            <p
              className={`mt-4 font-bold text-lg ${
                coin.market_data.price_change_percentage_1y_in_currency.usd >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Cambio 1 año:{" "}
              {coin.market_data.price_change_percentage_1y_in_currency.usd}%
              (USD)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cripto;
