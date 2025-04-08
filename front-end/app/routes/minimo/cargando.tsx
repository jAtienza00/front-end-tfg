import cargando from "../../../public/imagenes/cargando.png";
import React from "react";

function Cargando() {
    return (
      <div>
        <a target="_blank" href="https://icons8.com/icon/102455/spinner">
          <img src={cargando} className="animate-spin" alt="Cargando" /> 
        </a>    
      </div>
    );
}
export default Cargando;
