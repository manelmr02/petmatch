"use client"

import { useState, useEffect } from "react"
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
import { Check, Close } from "@mui/icons-material"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "../firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { useSnackbar } from "notistack"

export default function MisSolicitudes() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

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

  useEffect(() => {
    if (!user || !userRole) return

    const q = query(
      collection(db, "solicitudes"),
      where(userRole === "refugio" ? "refugioId" : "adoptanteId", "==", user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setSolicitudes(data)
      setLoading(false)
    })

    return () => unsub()
  }, [user, userRole])

  const actualizarEstado = async (id, estado) => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { estado })
      enqueueSnackbar(`Solicitud ${estado}`, { variant: "success" })
    } catch (err) {
      console.error("Error al actualizar estado:", err)
      enqueueSnackbar("Error al actualizar", { variant: "error" })
    }
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando solicitudes...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Mis Solicitudes
      </Typography>
      {solicitudes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>No tienes solicitudes.</Paper>
      ) : (
        <List>
          {solicitudes.map((s) => (
            <ListItem key={s.id} divider>
              <ListItemText
                primary={`Mascota: ${s.mascotaNombre}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Estado: {s.estado} • Refugio: {s.refugioNombre}
                    </Typography>
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

              {userRole === "refugio" && s.estado === "pendiente" && (
                <ListItemSecondaryAction>
                  <IconButton onClick={() => actualizarEstado(s.id, "aceptada")} color="success">
                    <Check />
                  </IconButton>
                  <IconButton onClick={() => actualizarEstado(s.id, "rechazada")} color="error">
                    <Close />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
              {userRole === "adoptante" && (
                <Box ml={2}>
                  <Chip label={s.estado} color={
                    s.estado === "aceptada" ? "success" :
                      s.estado === "rechazada" ? "error" : "default"
                  } />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}
      <Box mt={2} textAlign="center">
        <Button variant="outlined" onClick={() => history.back()}>Volver</Button>
      </Box>
    </Container>
  )
}
