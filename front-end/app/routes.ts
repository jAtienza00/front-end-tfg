import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("./routes/home.tsx"), 
    route("usuario/:id", "./routes/perfil.tsx"),
    route("enter", "./routes/enter.tsx"),
    route("cripto","./routes/criptos.tsx"),
    route("cripto/:id", "./routes/cripto.tsx"),

    route("chats", "./routes/vistasChats.tsx"),
    route("chats/:id", "./routes/chat.tsx"),
    route("chat/crear", "./routes/crearChat.tsx"),
    route("chat/unirse", "./routes/unirseChat.tsx"),
    route("chat/:id/actualizar", "./routes/actualizarChat.tsx"),

    route("cursos", "./routes/cursosVistas.tsx"),
    route("cursos/:id", "./routes/curso.tsx"),
    route("crear-curso", "./routes/crearCurso.tsx"),
    /*route("cursos/:id/actualizar", "./routes/actualizarCurso.tsx")*/
] satisfies RouteConfig;
