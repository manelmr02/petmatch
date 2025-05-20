import React from "react";
import logo from "../assets/logoPetMatchNoBg.png"; 
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-600 py-4 mt-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo PetMatch" className="h-6 w-auto max-w-[32px]" />
          <span className="font-semibold text-base">PetMatch</span>
        </div>
        <p className="text-sm mt-2 md:mt-0 text-center md:text-right">
          © {new Date().getFullYear()} PetMatch. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
