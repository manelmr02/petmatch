// Directiva de Next.js (no necesaria si usás Vite/CRA, en este caso aunque se use Vite, lo pongo debido a buena praxis que nos recomendaron en las practicas)
"use client"

// Importaciones necesarias desde Material UI
import {
    Container, Typography, Paper, TextField, Button, Box, CircularProgress, Autocomplete, Avatar
} from "@mui/material"

// Hooks de React
import { useEffect, useState } from "react"

// Firebase: autenticación, base de datos y almacenamiento
import { auth, db, storage } from "../firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Snackbar para mostrar notificaciones al usuario
import { useSnackbar } from "notistack"

// Componente de entrada de número de teléfono con formato internacional
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

// Lista de provincias que se usarán en el Autocomplete
const provincias = [
    "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos",
    "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada",
    "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja",
    "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
    "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
    "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
]

export default function Perfil() {
    // Estado del formulario con los datos del usuario
    const [form, setForm] = useState({})

    // Indicador de carga inicial
    const [loading, setLoading] = useState(true)

    // Indicador de guardado en proceso
    const [saving, setSaving] = useState(false)

    // Estado para comparar si el formulario ha cambiado
    const [initialForm, setInitialForm] = useState({})

    // Tipo de usuario ("adoptantes" o "refugios")
    const [tipo, setTipo] = useState("")

    // Vista previa de imagen cargada
    const [imagePreview, setImagePreview] = useState(null)

    // Hook de snackbar para mostrar notificaciones
    const { enqueueSnackbar } = useSnackbar()

    // Efecto que obtiene los datos del usuario al cargar la vista
    useEffect(() => {
        const fetchUser = async () => {
            const uid = auth.currentUser?.uid
            if (!uid) return

            // Comprobamos si el usuario está en "adoptantes" o en "refugios"
            for (const tipoUsuario of ["adoptantes", "refugios"]) {
                const refDoc = doc(db, tipoUsuario, uid)
                const snap = await getDoc(refDoc)
                if (snap.exists()) {
                    const data = snap.data()
                    setForm(data)
                    setInitialForm(data)
                    setTipo(tipoUsuario)
                    setImagePreview(snap.data().imagen || null)
                    break
                }
            }
            setLoading(false)
        }

        fetchUser()
    }, [])

    // Maneja el cambio en los campos del formulario
    const handleChange = (e) => {
        const { name, value, files } = e.target || {}
        const val = files ? files[0] : value

        setForm((prev) => ({ ...prev, [name]: val }))

        // Si se cambia la imagen, generamos la vista previa
        if (name === "imagen" && files?.[0]) {
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result)
            reader.readAsDataURL(files[0])
        }
    }

    // Envía los datos del formulario a Firestore y Storage
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const uid = auth.currentUser.uid
            let updatedData = { ...form }

            // Si hay nueva imagen, la subimos a Firebase Storage y guardamos su URL
            if (form.imagen instanceof File) {
                const storageRef = ref(storage, `usuarios/${tipo}/${uid}/perfil.jpg`)
                await uploadBytes(storageRef, form.imagen)
                const url = await getDownloadURL(storageRef)
                updatedData.imagen = url
            }

            // Actualizamos los datos en Firestore
            await updateDoc(doc(db, tipo, uid), updatedData)

            // También actualizamos el usuario actual en Firebase Auth (nombre e imagen)
            const snap = await getDoc(doc(db, tipo, uid))
            const data = snap.data()
            auth.currentUser.displayName = data?.nombre?.split(" ")[0] || data?.nombreRefugio?.split(" ")[0]
            auth.currentUser.photoURL = data?.imagen || null

            enqueueSnackbar("Perfil actualizado correctamente", { variant: "success" })
        } catch (err) {
            enqueueSnackbar("Error al guardar: " + err.message, { variant: "error" })
        } finally {
            setSaving(false)
        }
    }

    // Mientras se cargan los datos del usuario, mostramos un spinner
    if (loading) {
        return <Box textAlign="center" mt={10}><CircularProgress /></Box>
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Box textAlign="center" mb={2}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            background: "linear-gradient(45deg, #2196F3, #1976D2)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Editar Perfil
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Edita la información de tu perfil.
                    </Typography>
                </Box>

                {/* Formulario del perfil */}
                <form onSubmit={handleSubmit}>
                    {/* Si es adoptante, mostramos estos campos */}
                    {tipo === "adoptantes" ? (
                        <>
                            <TextField label="Nombre" name="nombre" value={form.nombre || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <TextField label="Apellidos" name="apellidos" value={form.apellidos || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <TextField label="DNI" name="dni" value={form.dni || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <TextField label="Dirección" name="direccion" value={form.direccion || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <Autocomplete
                                options={provincias}
                                value={form.provincia || null}
                                onChange={(_, value) => setForm((prev) => ({ ...prev, provincia: value }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="Provincia" margin="normal" required />
                                )}
                            />
                        </>
                    ) : (
                        // Si es refugio, mostramos otros campos
                        <>
                            <TextField label="Nombre del Refugio" name="nombreRefugio" value={form.nombreRefugio || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <TextField label="Dirección" name="direccion" value={form.direccion || ""} onChange={handleChange} fullWidth margin="normal" required />
                            <Autocomplete
                                options={provincias}
                                value={form.provincia || null}
                                onChange={(_, value) => setForm((prev) => ({ ...prev, provincia: value }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="Provincia" margin="normal" required />
                                )}
                            />
                            <TextField label="Web" name="web" value={form.web || ""} onChange={handleChange} fullWidth margin="normal" />
                        </>
                    )}

                    {/* Campo de teléfono con componente PhoneInput */}
                    <Box mt={2}>
                        <PhoneInput
                            country="es"
                            value={form.telefono || ""}
                            onChange={(value) => setForm((prev) => ({ ...prev, telefono: value }))}
                            inputStyle={{ width: "100%", height: 56, borderRadius: 8 }}
                            specialLabel="Teléfono"
                            inputProps={{ name: "telefono", required: true }}
                            disabled={saving}
                        />
                    </Box>

                    {/* Subida de imagen */}
                    <Box mt={3}>
                        <Button variant="outlined" component="label" fullWidth>
                            Cambiar Imagen de Perfil
                            <input type="file" name="imagen" accept="image/*" hidden onChange={handleChange} />
                        </Button>
                    </Box>

                    {/* Vista previa de la imagen si está seleccionada */}
                    {imagePreview && (
                        <Box mt={2} display="flex" justifyContent="center">
                            <Avatar src={imagePreview} sx={{ width: 96, height: 96 }} />
                        </Box>
                    )}

                    {/* Botón para guardar los cambios, deshabilitado si no hay cambios o se está guardando */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={saving || JSON.stringify(form) === JSON.stringify(initialForm)}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                    </Button>
                </form>
            </Paper>
        </Container>
    )
}
