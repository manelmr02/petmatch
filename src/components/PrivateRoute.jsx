// Componente de navegación de React Router para redirigir
import { Navigate } from "react-router-dom"

// Hook para obtener el estado de autenticación del usuario en tiempo real
import { useAuthState } from "react-firebase-hooks/auth"

// Instancia de autenticación de Firebase
import { auth } from "../firebase"

// Componentes visuales de Material UI
import { CircularProgress, Box, Typography } from "@mui/material"

// React hooks
import { useEffect, useState } from "react"

// Componente que protege rutas privadas: solo renderiza hijos si hay un usuario autenticado
export default function PrivateRoute({ children }) {
  // user: contiene el usuario si está logueado
  // loading: true mientras Firebase comprueba si hay sesión activa
  const [user, loading] = useAuthState(auth)

  // Estado para mostrar advertencia si tarda demasiado en cargar
  const [showWarning, setShowWarning] = useState(false)

  // Estado para saber cuándo redirigir al login si no hay sesión
  const [redirect, setRedirect] = useState(false)

  // useEffect que gestiona temporizadores para mostrar advertencia y redirigir
  useEffect(() => {
    // A los 5 segundos, si no hay usuario ni redirección, mostramos advertencia
    const warningTimer = setTimeout(() => {
      if (!user && !redirect) setShowWarning(true)
    }, 5000)

    // A los 10 segundos, si no hay usuario y ya terminó de cargar, redirigimos
    const redirectTimer = setTimeout(() => {
      if (!user && !loading) setRedirect(true)
    }, 10000)

    // Limpiamos los timers si el componente se desmonta o cambian dependencias
    return () => {
      clearTimeout(warningTimer)
      clearTimeout(redirectTimer)
    }
  }, [loading, user])

  // Mientras se carga la sesión o aún no hemos redirigido, mostramos spinner y mensaje opcional
  if (loading || (!user && !redirect)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        gap={2}
      >
        {/* Spinner de carga */}
        <CircularProgress />
        
        {/* Si pasaron 5 segundos sin usuario, mostramos advertencia */}
        {showWarning && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            maxWidth={300}
          >
            Esto está tardando más de lo normal. Puede que no tengas acceso porque no has iniciado sesión.
            Redirigiéndote al login...
          </Typography>
        )}
      </Box>
    )
  }

  // Si hay usuario, mostramos los hijos (contenido protegido). Si no, redirigimos al login
  return user ? children : <Navigate to="/login" replace />
}
