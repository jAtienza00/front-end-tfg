import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("./routes/home.tsx"), 
    route("cripto","./routes/criptos.tsx"),
    route("cripto/:id", "./routes/cripto.tsx"),
    route("chats", "./routes/chat.tsx"),
] satisfies RouteConfig;
