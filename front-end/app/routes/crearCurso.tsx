import React, { useState, useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useNavigate } from 'react-router';
import Cargando from '../components/minimo/cargando';
import env from '../services/env';

interface CursoCreationResponse {
    message: string;
    id: number;
    nombre: string;
}

export const meta: MetaFunction = () => {
  return [{ title: "Crear Nuevo Curso" }];
};

export default function CrearCursoPage() {
    const [nombre, setNombre] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [imagen, setImagen] = useState<File | null>(null);
    const [colorFondo, setColorFondo] = useState<string>('#FFFFFF'); 
    const [colorTexto, setColorTexto] = useState<string>('#000000'); 


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errorMax, setErrorMax] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const navigate = useNavigate();

    // Check for auth token on mount
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        const id = localStorage.getItem("id");
        if (!token || !id) {
            setErrorMax("Debes iniciar sesión para crear un curso.");
        }
        setToken(token);
        setId(id);
    }, []); // Añadido array de dependencias vacío

    if (errorMax) {
        return (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {errorMax}
            </div>
        ) 
        
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        let id_user = localStorage.getItem("id");
        let token = localStorage.getItem("jwt");
        if (!token|| !id_user) {
            setError("Debes iniciar sesión para crear un curso.");
            return;
        }


        let trimmedNombre = nombre.trim();
        if (!trimmedNombre) {
            setError("El nombre del curso es obligatorio.");
            return;
        }

        let descripcionTrimmed = descripcion.trim();
        if (!descripcionTrimmed) {
            setError("La descripción del curso es obligatoria.");
            return;
        }

        if (!colorFondo) {
            setError("Debes seleccionar un color de fondo.");
            return;
        }
        if (!colorTexto) {
            setError("Debes seleccionar un color de texto.");
            return;
        }

        const formData = new FormData();
        formData.append('nombre', trimmedNombre);
        formData.append('descripcion', descripcionTrimmed);
        if (imagen) {
            formData.append('imagen', imagen);
        }
        formData.append('color_fondo', colorFondo);
        formData.append('color_texto', colorTexto);

        setIsLoading(true);

        try {
            const response = await fetch(env.urlPHP() + "/api/cursos", { 
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    'X-USER_ID': id_user,
                },
                body: formData,
            });

            if (!response.ok) {
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

            const result: CursoCreationResponse = await response.json();
            setSuccessMessage(result.message || `Curso "${trimmedNombre}" creado con éxito! Redirigiendo...`);
            
            setTimeout(() => navigate(`/cursos/${result.id}`), 2000);
            setNombre('');
            setDescripcion('');
            setImagen(null);
            setColorFondo('#FFFFFF');
            setColorTexto('#000000');
            
        } catch (err: any) {
            console.error("Error al crear el curso:", err);
            setError(err.message || "No se pudo crear el curso. Inténtalo de nuevo más tarde.");
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
                Crear Nuevo Curso
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
                            Nombre del Curso
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: Curso de Criptos"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                            Descripción:
                        </label>
                        <input
                            type="text"
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: Descripcion magnifica"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                            Imagen:
                        </label>
                        <input
                            type="file"
                            id="imagen"
                            onChange={(e) => setImagen(e.target.files ? e.target.files[0] : null)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="color_fondo" className="block text-sm font-medium text-gray-700">
                            Color de Fondo:
                        </label>
                        <input
                            type="color"
                            id="color_fondo"
                            value={colorFondo}
                            onChange={(e) => setColorFondo(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="color_texto" className="block text-sm font-medium text-gray-700">
                            Color de Texto:
                        </label>
                        <input
                            type="color"
                            id="color_texto"
                            value={colorTexto}
                            onChange={(e) => setColorTexto(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                <span className="ml-2">Creando...</span>
                            </>
                        ): 'Crear Curso'}
                    </button>
                </form>
            ) : (
                 <div className="text-center text-red-600 p-4 bg-red-50 rounded-md border border-red-300">
                    <p className="font-semibold">Acceso Denegado</p>
                    <p>Debes iniciar sesión para poder crear un nuevo curso.</p>
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