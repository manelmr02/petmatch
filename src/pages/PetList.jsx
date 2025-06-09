"use client"

// Hooks de React para manejar estado y efectos secundarios
import { useState, useEffect } from "react"
// Hook de React Router para redirecciones programáticas
import { useNavigate } from "react-router-dom"
// Importación de componentes visuales desde Material UI
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  InputAdornment,
} from "@mui/material"

// Iconos de Material UI para botones y acciones comunes
import { Close, Edit, Delete, Add, Pets, Search, FilterList, Clear } from "@mui/icons-material"
// Hook de Firebase Auth para escuchar cambios de sesión
import { onAuthStateChanged } from "firebase/auth"
// Funciones de Firestore para lectura/escritura en la base de datos
import {
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore"
// Funciones de Firebase Storage para subir archivos e imágenes
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// Configuración de Firebase (auth, base de datos y almacenamiento)
import { auth, db, storage } from "../firebase"

// Hook para mostrar notificaciones tipo snackbar al usuario
import { useSnackbar } from "notistack"

// Componente principal para listar, filtrar, ver y publicar mascotas
export default function PetList() {
  const navigate = useNavigate()// Para navegación programática entre rutas
  // Estado que almacena todas las mascotas disponibles en la plataforma
  const [pets, setPets] = useState([])
  // Mascotas filtradas según los filtros activos
  const [filteredPets, setFilteredPets] = useState([])
   // Mascota seleccionada para mostrar detalles en el modal
  const [selectedPet, setSelectedPet] = useState(null)
  // Usuario autenticado actual
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'adoptante', 'refugio', null
   // Información extra del refugio si el usuario tiene ese rol
  const [refugioInfo, setRefugioInfo] = useState(null)
  // Estado de carga mientras se recuperan las mascotas o sesión
  const [loading, setLoading] = useState(true)
  // Estado que guarda los filtros aplicados por el usuario
  const [filters, setFilters] = useState({
    especie: "",
    edad: "",
    refugio: "",
    busqueda: "",
  })
  // Estado que controla si el diálogo para agregar mascota está abierto
  const [openAddDialog, setOpenAddDialog] = useState(false)
  // Datos del formulario para publicar nueva mascota
  const [newPet, setNewPet] = useState({
    nombre: "",
    especie: "Perro",
    raza: "",
    edad: "",
    descripcion: "",
    foto: null,
    caracteristicas: [],
  })
  // Característica temporal que se añade al array de características
  const [newCharacteristic, setNewCharacteristic] = useState("")
  // Estado para indicar si se está publicando una mascota
  const [submitting, setSubmitting] = useState(false)
  // Estado para mostrar una vista previa de la foto antes de subirla
  const [photoPreview, setPhotoPreview] = useState(null)
  const { enqueueSnackbar } = useSnackbar() // Para mostrar mensajes tipo snackbar

  // Escuchar cambios de autenticación y obtener rol del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Obtener el rol del usuario desde Firestore
          const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserRole(userData.rol || "adoptante") // Por defecto es adoptante

            // Si es refugio, obtener información adicional
            if (userData.rol === "refugio") {
              const refugioDoc = await getDoc(doc(db, "refugios", currentUser.uid))
              if (refugioDoc.exists()) {
                setRefugioInfo(refugioDoc.data())
              }
            }
          } else {
            setUserRole("adoptante") // Por defecto
          }
        } catch (error) {
          console.error("Error al obtener información del usuario:", error)
          setUserRole("adoptante") // Por defecto en caso de error
        }
      } else {
        setUserRole(null)
        setRefugioInfo(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Cargar mascotas desde Firestore
  useEffect(() => {
    const fetchPets = async () => {
      try {
        // Crear una consulta ordenada por fecha (más recientes primero)
        const q = query(collection(db, "mascotas"), orderBy("fecha", "desc"))

        // Usar onSnapshot para actualizaciones en tiempo real
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const petsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              fecha: doc.data().fecha?.toDate?.() || new Date(doc.data().fecha), // Convertir timestamp a Date
            }))
            setPets(petsData)
            setFilteredPets(petsData)
            setLoading(false)
          },
          (error) => {
            console.error("Error al obtener mascotas:", error)
            enqueueSnackbar("Error al cargar las mascotas", { variant: "error" })
            setLoading(false)
          },
        )

        return unsubscribe
      } catch (error) {
        console.error("Error al configurar el listener de mascotas:", error)
        setLoading(false)
      }
    }

    fetchPets()
  }, [enqueueSnackbar])

  // Aplicar filtros
  useEffect(() => {
    let filtered = pets

    if (filters.especie) {
      filtered = filtered.filter((pet) => pet.especie === filters.especie)
    }

    if (filters.refugio) {
      filtered = filtered.filter((pet) => pet.refugio === filters.refugio)
    }

    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase()
      filtered = filtered.filter(
        (pet) =>
          pet.nombre?.toLowerCase().includes(searchTerm) ||
          pet.raza?.toLowerCase().includes(searchTerm) ||
          pet.descripcion?.toLowerCase().includes(searchTerm),
      )
    }

    setFilteredPets(filtered)
  }, [filters, pets])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePetClick = (pet) => {
    setSelectedPet(pet)
  }

  const handleCloseModal = () => {
    setSelectedPet(null)
  }

  const handleAdoptionRequest = async () => {
    if (!user) {
      enqueueSnackbar("Debes iniciar sesión para solicitar adopción", {
        variant: "warning",
      })
      return
    }

    if (!selectedPet) {
      enqueueSnackbar("Error: No se ha seleccionado ninguna mascota", {
        variant: "error",
      })
      return
    }

    try {
      let usuarioData = {}

      // Primero intentamos desde "adoptantes"
      const adoptanteDoc = await getDoc(doc(db, "adoptantes", user.uid))
      if (adoptanteDoc.exists()) {
        usuarioData = adoptanteDoc.data()
      } else {
        // Si no está en "adoptantes", probamos en "usuarios"
        const userDoc = await getDoc(doc(db, "usuarios", user.uid))
        if (userDoc.exists()) {
          usuarioData = userDoc.data()
        }
      }

      // Crear solicitud en Firestore
      await addDoc(collection(db, "solicitudes"), {
        mascotaId: selectedPet.id,
        adoptanteId: user.uid,
        refugioId: selectedPet.refugioId,
        estado: "pendiente",
        fecha: serverTimestamp(),
        mascotaNombre: selectedPet.nombre,
        refugioNombre: selectedPet.refugio,
        adoptanteNombre: usuarioData.nombre || user.email,
        adoptanteEmail: usuarioData.email || user.email,
        adoptanteTelefono: usuarioData.telefono || "",
      })

      enqueueSnackbar("Solicitud de adopción enviada correctamente", {
        variant: "success",
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error al enviar solicitud:", error)
      enqueueSnackbar("Error al enviar la solicitud", {
        variant: "error",
      })
    }
  }

  const handleEditPet = (petId) => {
    // Implementar edición de mascota
    console.log("Editando mascota con ID:", petId)
    enqueueSnackbar("Función de edición en desarrollo", {
      variant: "info",
    })
  }

  const handleDeletePet = async (petId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
      try {
        await deleteDoc(doc(db, "mascotas", petId))
        enqueueSnackbar("Publicación eliminada correctamente", {
          variant: "success",
        })
        handleCloseModal()
      } catch (error) {
        console.error("Error al eliminar mascota:", error)
        enqueueSnackbar("Error al eliminar la publicación", {
          variant: "error",
        })
      }
    }
  }

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true)
  }

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false)
    setNewPet({
      nombre: "",
      especie: "Perro",
      raza: "",
      edad: "",
      descripcion: "",
      foto: null,
      caracteristicas: [],
    })
    setPhotoPreview(null)
  }

  const handleNewPetChange = (field, value) => {
    setNewPet((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewPet((prev) => ({
        ...prev,
        foto: file,
      }))

      // Crear preview
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCharacteristic = () => {
    if (newCharacteristic.trim() && !newPet.caracteristicas.includes(newCharacteristic.trim())) {
      setNewPet((prev) => ({
        ...prev,
        caracteristicas: [...prev.caracteristicas, newCharacteristic.trim()],
      }))
      setNewCharacteristic("")
    }
  }

  const handleRemoveCharacteristic = (index) => {
    setNewPet((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index),
    }))
  }

  const handleSubmitNewPet = async () => {
    // Validar campos
    if (!newPet.nombre || !newPet.raza || !newPet.edad || !newPet.descripcion || !newPet.foto) {
      enqueueSnackbar("Por favor completa todos los campos obligatorios", {
        variant: "warning",
      })
      return
    }

    setSubmitting(true)

    try {
      // 1. Subir foto a Storage
      const storageRef = ref(storage, `mascotas/${Date.now()}_${newPet.foto.name}`)
      await uploadBytes(storageRef, newPet.foto)
      const photoURL = await getDownloadURL(storageRef)

      // 2. Crear documento en Firestore
      const petData = {
        nombre: newPet.nombre,
        especie: newPet.especie,
        raza: newPet.raza,
        edad: newPet.edad,
        descripcion: newPet.descripcion,
        foto: photoURL,
        caracteristicas: newPet.caracteristicas,
        refugio: refugioInfo?.nombreRefugio,
        refugioId: user.uid,
        fecha: serverTimestamp(),
      }

      await addDoc(collection(db, "mascotas"), petData)

      enqueueSnackbar("Mascota publicada correctamente", {
        variant: "success",
      })
      handleCloseAddDialog()
    } catch (error) {
      console.error("Error al publicar mascota:", error)
      enqueueSnackbar("Error al publicar la mascota", {
        variant: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getUniqueValues = (field) => {
    return [...new Set(pets.map((pet) => pet[field]).filter(Boolean))]
  }

  const canEditPet = (pet) => {
    // El refugio puede editar sus propias mascotas
    return userRole === "refugio" && user && pet.refugioId === user.uid
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center", py: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando mascotas...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Título */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Mascotas en Adopción
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Encuentra a tu compañero perfecto
        </Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        {user && (
          <Button
            variant="outlined"
            onClick={() => navigate("/solicitudes")}
          >
            Mis Solicitudes
          </Button>
        )}
      </Box>

      {userRole === "refugio" && (
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Subir mascota
          </Button>
        </Box>
      )}

      {/* Filtros */}
      <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Filtros de búsqueda</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar por nombre o raza"
              value={filters.busqueda}
              onChange={(e) => handleFilterChange("busqueda", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: filters.busqueda ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange("busqueda", "")}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Especie</InputLabel>
              <Select
                value={filters.especie}
                label="Especie"
                onChange={(e) => handleFilterChange("especie", e.target.value)}
              >
                <MenuItem value="">
                  Todas
                </MenuItem>
                {getUniqueValues("especie").map((especie) => (
                  <MenuItem key={especie} value={especie}>
                    {especie}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Refugio</InputLabel>
              <Select
                value={filters.refugio}
                label="Refugio"
                onChange={(e) => handleFilterChange("refugio", e.target.value)}
              >
                <MenuItem value="">
                  Todos
                </MenuItem>
                {getUniqueValues("refugio").map((refugio) => (
                  <MenuItem key={refugio} value={refugio}>
                    {refugio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ especie: "", edad: "", refugio: "", busqueda: "" })}
              sx={{ height: "56px" }}
              startIcon={<Clear />}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de mascotas o mensaje de no hay mascotas */}
      {filteredPets.length > 0 ? (
        <Grid container spacing={3}>
          {filteredPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: 210,
                  height: 420,
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={pet.foto}
                  alt={pet.nombre}
                  sx={{
                    height: 220,
                    width: "100%",
                    objectFit: "cover",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                  }}
                />

                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {pet.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pet.especie} • {pet.raza}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Edad: {pet.edad}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pet.refugio}
                  </Typography>
                </CardContent>
                <Box p={2} mt="auto">
                  <Button fullWidth variant="contained" onClick={() => handlePetClick(pet)}>
                    Ver más
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "#f5f5f5",
            border: "1px dashed #ccc",
          }}
        >
          <Pets sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No hay mascotas disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {filters.busqueda || filters.especie || filters.refugio
              ? "No se encontraron mascotas con los filtros seleccionados. Intenta con otros criterios de búsqueda."
              : "Actualmente no hay mascotas disponibles para adopción. Vuelve a revisar pronto."}
          </Typography>
          {(filters.busqueda || filters.especie || filters.refugio) && (
            <Button
              variant="outlined"
              onClick={() => setFilters({ especie: "", edad: "", refugio: "", busqueda: "" })}
              startIcon={<Clear />}
            >
              Limpiar Filtros
            </Button>
          )}
        </Paper>
      )}

      {/* Modal de detalles */}
      <Dialog open={!!selectedPet} onClose={handleCloseModal} maxWidth="md" fullWidth>
        {selectedPet && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">{selectedPet.nombre}</Typography>
                <Box>
                  {canEditPet(selectedPet) && (
                    <>
                      <IconButton onClick={() => handleEditPet(selectedPet.id)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeletePet(selectedPet.id)} color="error">
                        <Delete />
                      </IconButton>
                    </>
                  )}
                  <IconButton onClick={handleCloseModal}>
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedPet.foto || "/placeholder.svg?height=300&width=300"}
                    alt={selectedPet.nombre}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información básica
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Especie:</strong> {selectedPet.especie}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Raza:</strong> {selectedPet.raza}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Edad:</strong> {selectedPet.edad}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Refugio:</strong> {selectedPet.refugio}
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Características
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedPet.caracteristicas?.map((caracteristica, index) => (
                      <Chip key={index} label={caracteristica} color="primary" variant="outlined" />
                    )) || "No hay características especificadas"}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Descripción
                  </Typography>
                  <Typography variant="body1">{selectedPet.descripcion}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cerrar</Button>
              {userRole === "adoptante" && (
                <Button variant="contained" color="primary" onClick={handleAdoptionRequest} startIcon={<Pets />}>
                  Solicitar Adopción
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog para agregar mascota */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Publicar nueva mascota</Typography>
            <IconButton onClick={handleCloseAddDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  height: 300,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Vista previa"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        p: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Button variant="contained" component="label" size="small">
                        Cambiar foto
                        <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Subir foto de la mascota
                    </Typography>
                    <Button variant="contained" component="label">
                      Seleccionar imagen
                      <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={newPet.nombre}
                onChange={(e) => handleNewPetChange("nombre", e.target.value)}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Especie</InputLabel>
                <Select
                  value={newPet.especie}
                  label="Especie"
                  onChange={(e) => handleNewPetChange("especie", e.target.value)}
                >
                  <MenuItem value="Perro">Perro</MenuItem>
                  <MenuItem value="Gato">Gato</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Raza"
                value={newPet.raza}
                onChange={(e) => handleNewPetChange("raza", e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Edad"
                value={newPet.edad}
                onChange={(e) => handleNewPetChange("edad", e.target.value)}
                margin="normal"
                required
                placeholder="Ej: 2 años, 6 meses"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={newPet.descripcion}
                onChange={(e) => handleNewPetChange("descripcion", e.target.value)}
                margin="normal"
                required
                multiline
                rows={4}
                placeholder="Describe la personalidad, historia y necesidades de la mascota..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Características
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="Añadir característica"
                  value={newCharacteristic}
                  onChange={(e) => setNewCharacteristic(e.target.value)}
                  sx={{ flexGrow: 1, mr: 1 }}
                  placeholder="Ej: Vacunado, Sociable, Juguetón..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCharacteristic()
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddCharacteristic}>
                  Añadir
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {newPet.caracteristicas.map((caracteristica, index) => (
                  <Chip
                    key={index}
                    label={caracteristica}
                    onDelete={() => handleRemoveCharacteristic(index)}
                    color="primary"
                  />
                ))}
              </Box>
              {newPet.caracteristicas.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Añade características para destacar cualidades de la mascota
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitNewPet} disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : "Publicar mascota"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  )
}
