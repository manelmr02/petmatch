import logoImage from "../assets/logoPetMatchNoBg.png"

function Footer() {
  return (
    <footer className="w-full py-4 bg-blue-500 text-white mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <img
            src={logoImage}
            alt="PetMatch Logo"
            width={40}
            height={40}
            className="mr-2 object-contain"
          />
          <span className="font-semibold text-lg">PetMatch</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} PetMatch. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
