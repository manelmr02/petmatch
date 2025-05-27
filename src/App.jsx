import { Routes, Route } from "react-router-dom"
import { SnackbarProvider } from "notistack"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PetList from "./pages/PetList"

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={4000}
    >
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mascotas" element={<PetList />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </SnackbarProvider>
  )
}

export default App
