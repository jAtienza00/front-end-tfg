import cargando from "../../../public/imagenes/cargando.png";
import React from "react";
import env from '../../services/env';

function Cargando() {
    return (
      <div>
        <a target="_blank" href={env.imagenCargando()}>
          <img src={cargando} className="animate-spin" alt="Cargando" /> 
        </a>    
      </div>
    );
}
export default Cargando;
