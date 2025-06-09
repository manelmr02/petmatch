"use client"

import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  MenuItem,
  Autocomplete,
  Avatar,
} from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { auth, db, storage } from "../firebase"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

const provincias = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos",
  "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada",
  "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja",
  "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
  "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
]

export default function Register() {
  const [userType, setUserType] = useState("adoptante")
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => phone?.length >= 10
  const validateDNI = (dni) => /^\d{8}[A-HJ-NP-TV-Z]$/i.test(dni)

  const handleChange = (e) => {
    const { name, value, files } = e.target || {}
    const val = files ? files[0] : value

    if (name === "userType") {
      setUserType(val)
      setForm({})
      setErrors({})
      setImagePreview(null)
    } else {
      setForm((prev) => ({ ...prev, [name]: val }))
      if (name === "imagen" && files?.[0]) {
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(files[0])
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { email, password, imagen, telefono, dni, ...rest } = form
    const newErrors = {}

    if (!validateEmail(email)) newErrors.email = "Formato de email inválido"
    if (!validatePhone(telefono)) newErrors.telefono = "Teléfono inválido"
    if (userType === "adoptante" && !validateDNI(dni)) newErrors.dni = "DNI inválido"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      enqueueSnackbar("Revisa los errores en el formulario", { variant: "error" })
      setLoading(false)
      return
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      let imageUrl = null

      if (imagen) {
        const storageRef = ref(storage, `usuarios/${userType}s/${uid}/perfil.jpg`)
        await uploadBytes(storageRef, imagen)
        imageUrl = await getDownloadURL(storageRef)
      }

      await setDoc(doc(db, `${userType}s`, uid), {
        uid,
        email,
        tipo: userType,
        telefono,
        ...(userType === "adoptante" && { dni }),
        ...rest,
        imagen: imageUrl || null,
        creadoEn: new Date().toISOString(),
      })

      await setDoc(doc(db, "usuarios", uid), {
        rol: userType,
      })

      enqueueSnackbar("Cuenta creada con éxito", { variant: "success" })
      navigate("/mascotas")
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const commonProps = {
    fullWidth: true,
    margin: "normal",
    onChange: handleChange,
    disabled: loading,
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  }

  const withError = (name) => ({
    ...commonProps,
    error: Boolean(errors[name]),
    helperText: errors[name] || undefined,
  })

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", background: "linear-gradient(45deg, #2196F3, #1976D2)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 1 }}>
              Crear Cuenta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Regístrate en PetMatch 🐾
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField select label="Tipo de usuario" name="userType" value={userType} onChange={handleChange} {...commonProps}>
              <MenuItem value="adoptante">Adoptante</MenuItem>
              <MenuItem value="refugio">Refugio</MenuItem>
            </TextField>

            {userType === "adoptante" && (
              <>
                <TextField label="Nombre" name="nombre" {...withError("nombre")} required />
                <TextField label="Apellidos" name="apellidos" {...withError("apellidos")} required />
                <TextField label="DNI" name="dni" {...withError("dni")} required />
                <Box mt={2}>
                  <PhoneInput
                    country="es"
                    value={form.telefono || ""}
                    onChange={(value) => setForm((prev) => ({ ...prev, telefono: value }))}
                    inputStyle={{ width: "100%", height: 56, borderRadius: 8 }}
                    specialLabel="Teléfono"
                    inputProps={{ name: "telefono", required: true }}
                    disabled={loading}
                  />
                  {errors.telefono && (
                    <Typography variant="caption" color="error">{errors.telefono}</Typography>
                  )}
                </Box>
                <TextField label="Dirección" name="direccion" {...withError("direccion")} required />
                <Autocomplete
                  options={provincias}
                  value={form.provincia || null}
                  onChange={(_, value) => setForm((prev) => ({ ...prev, provincia: value }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Provincia"
                      name="provincia"
                      placeholder="Selecciona una provincia..."
                      required
                      {...withError("provincia")}
                    />
                  )}
                  fullWidth
                  disableClearable
                />
              </>
            )}

            {userType === "refugio" && (
              <>
                <TextField label="Nombre del Refugio" name="nombreRefugio" {...withError("nombreRefugio")} required />
                <TextField label="Dirección" name="direccion" {...withError("direccion")} required />
                <Autocomplete
                  options={provincias}
                  value={form.provincia || null}
                  onChange={(_, value) => setForm((prev) => ({ ...prev, provincia: value }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Provincia"
                      name="provincia"
                      placeholder="Selecciona una provincia..."
                      required
                      {...withError("provincia")}
                    />
                  )}
                  fullWidth
                  disableClearable
                />
                <TextField label="Web" name="web" {...withError("web")} />
                <Box mt={2}>
                  <PhoneInput
                    country="es"
                    value={form.telefono || ""}
                    onChange={(value) => setForm((prev) => ({ ...prev, telefono: value }))}
                    inputStyle={{ width: "100%", height: 56, borderRadius: 8 }}
                    specialLabel="Teléfono"
                    inputProps={{ name: "telefono", required: true }}
                    disabled={loading}
                  />
                  {errors.telefono && (
                    <Typography variant="caption" color="error">{errors.telefono}</Typography>
                  )}
                </Box>
              </>
            )}

            <TextField label="Correo electrónico" type="email" name="email" {...withError("email")} required />
            <TextField label="Contraseña" type="password" name="password" {...withError("password")} required />

            <Button variant="outlined" component="label" fullWidth sx={{ mt: 2, mb: 1, borderRadius: 2 }}>
              Subir imagen
              <input type="file" name="imagen" accept="image/*" hidden onChange={handleChange} />
            </Button>

            {imagePreview && (
              <Box mt={2} textAlign="center">
                <Typography variant="caption" color="text.secondary">Previsualización de la imagen de perfil:</Typography>
                <Box mt={1} display="flex" justifyContent="center">
                  <Avatar src={imagePreview} alt="Preview" sx={{ width: 96, height: 96, borderRadius: 2, boxShadow: 2 }} />
                </Box>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(45deg, #2196F3, #1976D2)",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2, #1565C0)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(33,150,243,0.4)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "REGISTRARSE"}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  )
}
