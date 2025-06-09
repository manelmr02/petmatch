// Directiva de Next.js (no necesaria si usás Vite/CRA, en este caso aunque se use Vite, lo pongo debido a buena praxis que nos recomendaron en las practicas)
"use client"

// Hooks de React
import { useState, useEffect } from "react"

// Componentes de Material UI para estructura, visualización y acción
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Box,
  CircularProgress,
} from "@mui/material"

// Iconos de acciones
import { Check, Close } from "@mui/icons-material"

// Firebase Auth
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "../firebase"

// Firestore para consultas, actualización y escucha en tiempo real
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"

// Snackbar para mostrar notificaciones
import { useSnackbar } from "notistack"

export default function MisSolicitudes() {
  // Estado de usuario actual autenticado
  const [user, setUser] = useState(null)
  // Rol del usuario ("adoptante" o "refugio")
  const [userRole, setUserRole] = useState(null)
  // Lista de solicitudes obtenidas de Firestore
  const [solicitudes, setSolicitudes] = useState([])
  // Estado de carga
  const [loading, setLoading] = useState(true)

  const { enqueueSnackbar } = useSnackbar()

  // Al iniciar sesión, obtenemos el rol del usuario desde la colección "usuarios"
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) return

      try {
        const userDocRef = doc(db, "usuarios", currentUser.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          setUserRole(userDoc.data().rol)
        }
      } catch (error) {
        console.error("Error al obtener rol del usuario:", error)
      }
    })

    return () => unsub()
  }, [])

  // Una vez tenemos el usuario y su rol, escuchamos las solicitudes asociadas
  useEffect(() => {
    if (!user || !userRole) return

    // Creamos una consulta diferente según el rol:
    // - Adoptante: buscamos solicitudes donde él sea el adoptante
    // - Refugio: solicitudes recibidas por su refugio
    const q = query(
      collection(db, "solicitudes"),
      where(userRole === "refugio" ? "refugioId" : "adoptanteId", "==", user.uid)
    )

    // Escuchamos en tiempo real los cambios en las solicitudes
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setSolicitudes(data)
      setLoading(false)
    })

    return () => unsub()
  }, [user, userRole])

  // Función que actualiza el estado de una solicitud (solo para refugios)
  const actualizarEstado = async (id, estado) => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { estado })
      enqueueSnackbar(`Solicitud ${estado}`, { variant: "success" })
    } catch (err) {
      console.error("Error al actualizar estado:", err)
      enqueueSnackbar("Error al actualizar", { variant: "error" })
    }
  }

  // Si aún estamos cargando datos, mostramos un spinner
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando solicitudes...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Mis Solicitudes
      </Typography>

      {/* Si no hay solicitudes, se muestra mensaje */}
      {solicitudes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>No tienes solicitudes.</Paper>
      ) : (
        // Renderizado de la lista de solicitudes
        <List>
          {solicitudes.map((s) => (
            <ListItem key={s.id} divider>
              <ListItemText
                primary={`Mascota: ${s.mascotaNombre}`}
                secondary={
                  <>
                    {/* Estado y nombre del refugio siempre visibles */}
                    <Typography component="span" variant="body2">
                      Estado: {s.estado} • Refugio: {s.refugioNombre}
                    </Typography>

                    {/* Si es refugio, también mostramos los datos del adoptante */}
                    {userRole === "refugio" && (
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Adoptante: {s.adoptanteNombre || "No disponible"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Email: {s.adoptanteEmail || "No disponible"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Teléfono: {s.adoptanteTelefono || "No disponible"}
                        </Typography>
                      </Box>
                    )}
                  </>
                }
              />

              {/* Si es refugio y la solicitud está pendiente, muestra botones para aceptar o rechazar */}
              {userRole === "refugio" && s.estado === "pendiente" && (
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => actualizarEstado(s.id, "aceptada")}
                    color="success"
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    onClick={() => actualizarEstado(s.id, "rechazada")}
                    color="error"
                  >
                    <Close />
                  </IconButton>
                </ListItemSecondaryAction>
              )}

              {/* Si es adoptante, mostramos el estado como Chip de color */}
              {userRole === "adoptante" && (
                <Box ml={2}>
                  <Chip
                    label={s.estado}
                    color={
                      s.estado === "aceptada"
                        ? "success"
                        : s.estado === "rechazada"
                        ? "error"
                        : "default"
                    }
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Botón para volver atrás */}
      <Box mt={2} textAlign="center">
        <Button variant="outlined" onClick={() => history.back()}>
          Volver
        </Button>
      </Box>
    </Container>
  )
}
