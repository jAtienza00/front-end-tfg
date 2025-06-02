import "../../app.css";
import X from "../../../public/imagenes/x.png";
import TikTok from "../../../public/imagenes/tiktok.png";
import instragram from "../../../public/imagenes/instagram.png";
import facebook from "../../../public/imagenes/f.png";

function Pie() {
  return (
    <div className="footer pt-10 bottom-0 flex flex-col justify-center items-center bg-black">
      <div className="flex flex-row text-white">
        <a href="#" className="mx-3">
          <img src={X} alt="X" className="footImg" />
        </a>
        <a href="#" className="mx-3">
          <img src={TikTok} alt="TikTok" className="footImg" />
        </a>
        <p>© 2025 Int€rCoin</p>
        <a href="#" className="mx-3">
          <img src={instragram} alt="Instagram" className="footImg" />
        </a>
        <a href="#" className="mx-3">
          <img src={facebook} alt="Facebook" className="footImg" />
        </a>
      </div>
      <div className="flex flex-row text-gray-300">
        <p>
          Icons by{" "}
          <a
            href="https://iconos8.es/"
            className="underline-offset-0 hover:underline"
          >
            icons8.com
          </a>
        </p>
      </div>
    </div>
  );
}
export default Pie;
