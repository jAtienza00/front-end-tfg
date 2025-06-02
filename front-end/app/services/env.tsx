const env = {
    urlPython: (): string => {
        let url = import.meta.env.VITE_URL_SERVER_PYTHON;
        return url ?? 'http://127.0.0.1:5000';
    },

    urlPHP: (): string => {
        let url = import.meta.env.VITE_URL_SERVER_PHP;
        return url ?? 'http://127.0.0.1:8000';
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