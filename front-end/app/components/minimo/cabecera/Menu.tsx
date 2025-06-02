import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import env from '../../../services/env';

function Menu() {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const nav = useNavigate();

  const handleContainerMouseEnter = () => setIsHovered(true);
  const handleContainerMouseLeave = () => setIsHovered(false);
  
  const handleButtonMouseEnter = () => setIsButtonHovered(true);
  const handleButtonMouseLeave = () => setIsButtonHovered(false);

  return (
    <div 
      className="relative"
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* Botón para abrir/cerrar menú */}
      <button
        className={`p-2 bg-green-800 text-white rounded-lg mx-5 transition-shadow duration-300 ${
          isHovered || isButtonHovered 
            ? "bg-white text-green-800 cursor-pointer shadow-lg scale-105 shadow-black" 
            : ""
        }`}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
      >
        <svg
          xmlns={env.imagenMenu()}
          width="30"
          height="30"
          fill={isHovered || isButtonHovered ? "black" : "white"}
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path d="M2 12h12v2H2v-2zm0-4h12v2H2V8zm0-4h12v2H2V4z" />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className={`absolute top-full mt-2 w-48 bg-white shadow-lg rounded-lg p-4 shadow-black scale-105 ${
          isHovered ? "block" : "hidden"
        }`}
      >
        <ul className="space-y-2">
          <li
            className="text-black hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => nav("/")}
          >
            Inicio
          </li>
          <li
            className="text-black hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => nav("/cripto")}
          >
            Criptos
          </li>
          <li
            className="text-black hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => nav("/chats")}
          >
            Chats
          </li>
          <li
            className="text-black hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => nav("/cursos")}
          >
            Cursos
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

export default Menu;
