// Importamos el componente Link de react-router-dom para hacer navegación interna sin recargar la página
import { Link } from "react-router-dom"

// Importamos la imagen del logo desde la carpeta de assets
import logoImage from "../assets/logoPetMatchNoBg.png"

// Definimos el componente funcional Footer
function Footer() {
  return (
    // El <footer> tiene un fondo azul, texto blanco, padding vertical y ocupa todo el ancho disponible
    <footer className="w-full py-4 bg-blue-500 text-white mt-auto">
      {/* Contenedor centrado con margen horizontal automático y padding horizontal */}
      {/* En pantallas pequeñas, los elementos están en columna; en pantallas medianas o superiores, en fila */}
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4">

        {/* Contenedor del logo e icono, con margen inferior en pantallas pequeñas */}
        <div className="flex items-center mb-2 sm:mb-0">
          {/* Link al inicio. Se usa <Link> en lugar de <a> para navegación sin recarga */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
            {/* Imagen del logo con efectos de escala al hacer hover */}
            <img
              src={logoImage} // Ruta de la imagen importada
              alt="PetMatch Logo" // Texto alternativo accesible
              width={40} // Ancho fijo
              height={40} // Alto fijo
              className="mr-2 object-contain cursor-pointer hover:scale-105 transition-transform duration-200" // Espaciado a la derecha, mantiene proporción, efecto de escala
            />
            {/* Nombre del proyecto con estilo y cursor de tipo puntero */}
            <span className="font-semibold text-lg text-white cursor-pointer">PetMatch</span>
          </Link>
        </div>

        {/* Texto con el año actual generado dinámicamente y mensaje de derechos */}
        <p className="text-sm">
          © {new Date().getFullYear()} PetMatch. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

// Exportamos el componente para que pueda ser usado en otras partes de la app
export default Footer

