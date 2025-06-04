const env = {
    urlPython: (): string => {
        let url = import.meta.env.VITE_URL_SERVER_PYTHON;
        return url ?? 'https://api-py-user-tfg-wzj8.onrender.com';
    },

    urlPHP: (): string => {
        let url = import.meta.env.VITE_URL_SERVER_PHP;
        return url ?? 'https://api-laravel-tfg-i0r0.onrender.com';
    },

    imagenMenu: (): string => {
        let menu = import.meta.env.VITE_IMAGEN_MENU;
        if (menu === undefined) {
            return "none"
        }
        return menu;
    },

    imagenCargando: (): string => {
        let cargando = import.meta.env.VITE_IMAGEN_CARGANDO;
        if (cargando === undefined) {
            return "none"
        }
        return cargando;
    },
}

export default env;