"use client"

import { useNavigate } from "react-router-dom"

import cachorros from "../assets/cachorrosFelices.png";

function Home() {
  const navigate = useNavigate()

  const handleJoinClick = () => {
    navigate("/register")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      <div className="text-center max-w-4xl mx-auto">

        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          ¡Bienvenido a <span className="text-blue-500">PetMatch</span>!
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8">Encuentra a tu mascota ideal</p>

        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <img
              src={cachorros}
              alt="Mascotas felices gracias a PetMatch"
              className="rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl max-w-full h-auto"
              style={{ maxHeight: "400px", width: "auto" }}
            />
            <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all duration-300"></div>
          </div>
        </div>

        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Conectamos corazones con patas. Descubre miles de mascotas esperando un hogar lleno de amor.
        </p>

        <button
          onClick={handleJoinClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          ¡Únete ahora!
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🐕</div>
            <h3 className="font-semibold text-gray-800 mb-2">Miles de mascotas</h3>
            <p className="text-gray-600">Encuentra tu alma gemela con patas.</p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">❤️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Adopción responsable</h3>
            <p className="text-gray-600">Proceso seguro y verificado para el bienestar animal</p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🏠</div>
            <h3 className="font-semibold text-gray-800 mb-2">Hogar perfecto</h3>
            <p className="text-gray-600">Te ayudamos a encontrar la mascota ideal para tu familia</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home