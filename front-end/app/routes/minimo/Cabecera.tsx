import React, { useState, useEffect } from "react";
import "../../app.css";
import { Link } from "react-router";
import Menu from "./cabecera/Menu";
import Buscar from "./cabecera/Buscar";
import Usuario from "./cabecera/Usuario";

function Cabecera() {
  return (
    <>
      <header className="bg-[#1fbd00] fixed top-0 w-full grid grid-cols-3 grid-rows-2 flex-between text-white text-[calc(5px+2vmin)] p-4 shadow-lg z-50 min-h-[10vh]">
        <Link to={"/"} className="col-span-3 text-center">
          <h1 className="title-hover text-2xl text-bold">
            Int€rCoin
          </h1>
        </Link>
        <div className="col-span-1 flex justify-center">
          <Menu />
        </div>
        <div className="col-span-1 flex justify-center">
          <Buscar />
        </div>
        <div className="col-span-1 flex justify-center">
          <Usuario />
        </div>
      </header>
    </>
  );
}

export default Cabecera;
