import '../../app.css';
import X from '../../../public/imagenes/x.png';
import TikTok from '../../../public/imagenes/tiktok.png';
import instragram from '../../../public/imagenes/instagram.png';
import facebook from '../../../public/imagenes/f.png';

function Pie() {
    return(
        <div className="footer bottom-0 flex justify-center items-center pt-4 bg-black">
        <a href="#" className="mx-3"><img src={X} alt="X" className="footImg"/></a>
        <a href="#" className="mx-3"><img src={TikTok} alt="TikTok" className="footImg"/></a>
        <p className="text-white">© 2025 Int€rCoin</p>
        <a href="#" className="mx-3"><img src={instragram} alt="Instagram" className="footImg"/></a>
        <a href="#" className="mx-3"><img src={facebook} alt="Facebook" className="footImg"/></a>
        </div>
    );
}
export default Pie;