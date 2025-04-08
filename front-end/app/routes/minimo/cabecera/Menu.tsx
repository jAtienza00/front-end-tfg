import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";

function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const nav = useNavigate();

  // Función para determinar el color según el estado de hover
  const getColor = (isHovered: boolean) => (isHovered ? "black" : "white");

  return (
    <div className="relative">
      {/* Botón para abrir/cerrar menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-green-800 text-white rounded-lg hover:bg-white hover:text-green-800 hover:cursor-pointer mx-5 hover:shadow-lg hover:scale-105 transition-shadow duration-300 hover:shadow-black"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill={getColor(isHovered)}
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path d="M2 12h12v2H2v-2zm0-4h12v2H2V8zm0-4h12v2H2V4z" />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className={`absolute top-full mt-2 w-48 bg-white shadow-lg rounded-lg p-4 hover:shadow-lg hover:shadow-black hover:scale-105   ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <ul className="space-y-2" onClick={() => setIsOpen(!isOpen)}>
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
        </ul>
      </motion.div>
    </div>
  );
}

export default Menu;
