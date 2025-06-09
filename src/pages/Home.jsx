// Directiva de Next.js (no necesaria si usás Vite/CRA, en este caso aunque se use Vite, lo pongo debido a buena praxis que nos recomendaron en las practicas, se aplica en las siguientes paginas, basicamente hace que el clente sea el que renderice la pagina)
"use client"

// Hook para redireccionar desde React Router
import { useNavigate } from "react-router-dom"

// Hooks de React
import { useEffect, useState } from "react"

// Imagen local de cachorros
import cachorros from "../assets/cachorrosFelices.png"

function Home() {
  // Hook de navegación programática
  const navigate = useNavigate()

  // Estado para controlar animación de aparición
  const [isVisible, setIsVisible] = useState(false)

  // Al montar el componente, activamos el estado visible para aplicar la animación
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Al pulsar el botón, redirigimos al registro
  const handleJoinClick = () => {
    navigate("/register")
  }

  return (
    // Contenedor principal con padding y centrado vertical/horizontal
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* Contenedor central con texto alineado y ancho máximo */}
      <div className="text-center max-w-4xl mx-auto">

        {/* Título principal con tamaño grande y palabra destacada en azul */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          ¡Bienvenido a <span className="text-blue-500">PetMatch</span>!
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Encuentra a tu mascota ideal
        </p>

        {/* Imagen de portada animada */}
        <div
          className={`mb-8 flex justify-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Contenedor con efectos visuales de grupo (hover) */}
          <div className="relative group">
            {/* Imagen de los cachorros con hover: zoom, sombra y leve rotación */}
            <img
              src={cachorros}
              alt="Mascotas felices"
              className="rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl group-hover:rotate-1 max-w-full h-auto"
              style={{ maxHeight: "400px", width: "auto" }}
            />

            {/* Gradiente superior al hacer hover, decorativo */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-all duration-500"></div>

            {/* Efecto de brillo en movimiento horizontal al hacer hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>

        {/* Mensaje promocional central */}
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Conectamos corazones con patas. Descubre miles de mascotas esperando un hogar lleno de amor.
        </p>

        {/* Botón de acción para registrarse */}
        <button
          onClick={handleJoinClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          ¡Únete ahora!
        </button>

        {/* Sección con 3 beneficios destacados, adaptativa en pantallas pequeñas y grandes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🐕</div>
            <h3 className="font-semibold text-gray-800 mb-2">Miles de mascotas</h3>
            <p className="text-gray-600">Encuentra tu alma gemela con patas.</p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">❤️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Adopción responsable</h3>
            <p className="text-gray-600">Proceso seguro y verificado para el bienestar animal.</p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🏠</div>
            <h3 className="font-semibold text-gray-800 mb-2">Hogar perfecto</h3>
            <p className="text-gray-600">Te ayudamos a encontrar la mascota ideal para tu familia.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
