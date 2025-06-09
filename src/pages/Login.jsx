// Directiva de Next.js (no necesaria si usás Vite/CRA, en este caso aunque se use Vite, lo pongo debido a buena praxis que nos recomendaron en las practicas)
"use client"

// Hooks de React para manejar estado
import { useState } from "react"

// Componentes de Material UI para el formulario y estilos
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material"

// Función de Firebase para iniciar sesión con email y contraseña
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"

// React Router: para navegación y enlaces
import { useNavigate, Link } from "react-router-dom"

// Snackbar para mostrar notificaciones emergentes
import { useSnackbar } from "notistack"

export default function Login() {
  // Estados locales para email, contraseña y loading
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  // Función que maneja el login cuando se envía el formulario
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Llamamos a Firebase Auth para iniciar sesión con email y contraseña
      await signInWithEmailAndPassword(auth, email, password)

      // Mostramos notificación positiva
      enqueueSnackbar("¡Bienvenido de nuevo! 🎉", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      })

      // Redirigimos a la página de mascotas
      navigate("/mascotas")
    } catch (error) {
      // Definimos mensajes personalizados según el tipo de error
      let errorMessage = "Error en el login"

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este email"
          break
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta"
          break
        case "auth/invalid-email":
          errorMessage = "Email inválido"
          break
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde"
          break
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas. Verifica tu email y contraseña"
          break
        default:
          errorMessage = "Error en el login: " + error.message
      }

      // Mostramos el mensaje de error
      enqueueSnackbar(errorMessage, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Contenedor principal centrado verticalmente con padding
    <div
      style={{
        minHeight: "calc(100vh - 120px)", // resta altura del header/footer
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0",
      }}
    >
      <Container maxWidth="sm">
        {/* Card con fondo blanco y desenfoque */}
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Encabezado del formulario */}
          <Box textAlign="center" mb={3}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3, #1976D2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ¡Bienvenido de vuelta a PetMatch! 🐾
            </Typography>
          </Box>

          {/* Formulario de login */}
          <form onSubmit={handleLogin}>
            {/* Campo de email */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                },
              }}
            />

            {/* Campo de contraseña */}
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                },
              }}
            />

            {/* Botón de login con spinner cuando loading=true */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(45deg, #2196F3, #1976D2)",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2, #1565C0)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(33, 150, 243, 0.4)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "INICIAR SESIÓN"}
            </Button>

            {/* Enlace para registrarse si no tiene cuenta */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#2196F3",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  )
}
