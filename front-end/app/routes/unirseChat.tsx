import React, { useState, useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useNavigate } from 'react-router';
import Cargando from '../components/minimo/cargando';
import env from '../services/env';

interface ChatPayload {
    clave: string;
}

interface ChatCreationResponse {
    message: string;
    clave: string;
    nombre: string;
}

export const meta: MetaFunction = () => {
  return [{ title: "Unete a un Chat" }];
};

export default function CrearChatPage() {
    const [clave, setClave] = useState<string>(''); 

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const navigate = useNavigate();

    // Check for auth token on mount
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        const id = localStorage.getItem("id");
        if (!token || !id) {
            setError("Debes iniciar sesión para crear un chat.");
        }
        setToken(token);
        setId(id);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!token || !id) {
            setError("Debes iniciar sesión para crear un chat.");
            return;
        }
        if (!clave.trim() && 0 < clave.length && clave.length < 10) {
            setError("La clave es obligatoria.");
            return;
        }

        const chatData: ChatPayload = {
            clave: clave.trim(),
        };

        setIsLoading(true);

        try {
            const response = await fetch(env.urlPython() + "/chats/unirse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({
                    ...chatData,
                    id: id // Assuming backend needs creator's ID
                }),
            });

            if (!response.ok) {
                // Attempt to get a more descriptive error message
                const text = await response.text();
                let errorMsg = `Error HTTP: ${response.status}`;
                try {
                    const errJson = JSON.parse(text);
                    if (errJson && errJson.message) errorMsg = errJson.message;
                } catch (e) {
                    // Not a JSON error, use text if available or default
                    if (text) errorMsg = text.substring(0,150);
                }
                throw new Error(errorMsg);
            }

            const result: ChatCreationResponse = await response.json();
            setSuccessMessage(result.message);
            setClave('');
            setTimeout(() => navigate(`/chats/${result.nombre}?clave=${clave}`), 2000); 

        } catch (err: any) {
            console.error("Error al crear el chat:", err);
            setError(err.message || "No se pudo crear el chat. Inténtalo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !error && !successMessage) { // Show full page loading only initially
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
                <Cargando />
            </div>
        );
    }


    return (
        <div className="container mx-auto p-6 max-w-lg mt-10 mb-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Unirse a Chat
            </h1>

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
            
            {token && id ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                            Clave del Chat
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: 1234567890"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Cargando /> 
                                <span className="ml-2">Uniendose...</span>
                            </>
                        ): 'Unirse a Chat'}
                    </button>
                </form>
            ) : (
                 <div className="text-center text-red-600 p-4 bg-red-50 rounded-md border border-red-300">
                    <p className="font-semibold">Acceso Denegado</p>
                    <p>Debes iniciar sesión para poder crear un nuevo chat.</p>
                    <button 
                        onClick={() => navigate('/login')} // Assuming you have a login route
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Ir a Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}