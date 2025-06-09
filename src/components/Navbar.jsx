// Directiva de Next.js que asegura que este componente se renderiza en el cliente (solo necesaria en Next.js, no en Vite)
"use client"

// Hooks de React
import { useState, useEffect } from "react"

// Componentes de Material UI
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material"

// React Router: para navegación entre rutas
import { Link, useNavigate } from "react-router-dom"

// Firebase: autenticación y base de datos
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

// Notificaciones estilo snackbar
import { useSnackbar } from "notistack"

// Iconos de Material UI
import Person from "@mui/icons-material/Person"
import Logout from "@mui/icons-material/Logout"
import ExpandMore from "@mui/icons-material/ExpandMore"

// Logo del proyecto
import logo from "../assets/logoPetMatchNoBg.png"

export default function Navbar() {
  // Estado del usuario actual autenticado
  const [user, setUser] = useState(null)
  // Estado para controlar el menú desplegable del usuario
  const [anchorEl, setAnchorEl] = useState(null)
  // Estado para controlar si la sesión se está verificando
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  // Booleano para saber si el menú está abierto
  const open = Boolean(anchorEl)

  // Al montar el componente, escuchamos el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Se comprueba si el usuario es adoptante o refugio
        const tipos = ["adoptantes", "refugios"]
        let userData = null

        // Buscamos los datos del usuario en la colección correspondiente
        for (const tipo of tipos) {
          const ref = doc(db, tipo, currentUser.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            userData = snap.data()
            break
          }
        }

        // Nombre a mostrar: primer nombre del usuario o prefijo del email
        const displayName =
          userData?.nombre?.split(" ")[0] ||
          userData?.nombreRefugio?.split(" ")[0] ||
          currentUser.email.split("@")[0]

        // Imagen de perfil si existe
        const photoURL = userData?.imagen || null

        // Se guarda el usuario en el estado con los datos formateados
        setUser({
          ...currentUser,
          displayName,
          photoURL,
        })
      } else {
        setUser(null)
      }

      // Terminamos de cargar
      setLoading(false)
    })

    // Cleanup del listener
    return () => unsubscribe()
  }, [])

  // Abre el menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  // Cierra el menú
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  // Redirige a la vista de perfil
  const handleEditProfile = () => {
    handleMenuClose()
    navigate("/perfil")
  }

  // Cierra la sesión del usuario
  const handleLogout = async () => {
    try {
      await signOut(auth)
      handleMenuClose()
      enqueueSnackbar("Sesión cerrada correctamente", { variant: "success" })
      navigate("/")
    } catch (error) {
      enqueueSnackbar("Error al cerrar sesión: " + error.message, { variant: "error" })
    }
  }

  // Devuelve las iniciales del nombre si no hay imagen de perfil
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Devuelve el nombre a mostrar en la interfaz
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split("@")[0]
    return "Usuario"
  }

  // Mientras se carga la sesión, mostramos solo la barra vacía con el título
  if (loading) {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PetMatch
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo como enlace al inicio */}
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src={logo}
            alt="PetMatch logo"
            style={{
              height: 60,
              marginRight: 10,
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        </Link>

        {/* Texto del título que actúa como enlace también */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
            transition: "opacity 0.2s ease-in-out",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          PetMatch
        </Typography>

        {/* Enlaces comunes para todos los usuarios */}
        <Button color="inherit" component={Link} to="/">
          Inicio
        </Button>
        <Button color="inherit" component={Link} to="/mascotas">
          Mascotas
        </Button>

        {/* Si hay usuario logueado, mostramos avatar y menú */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {/* Avatar con imagen o iniciales */}
              <Avatar
                src={user.photoURL}
                alt={getDisplayName()}
                sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
              >
                {!user.photoURL && getInitials(getDisplayName())}
              </Avatar>

              {/* Nombre del usuario */}
              <Typography variant="body1" sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                {getDisplayName()}
              </Typography>

              {/* Icono para expandir menú */}
              <ExpandMore
                sx={{
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </Button>

            {/* Menú desplegable */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  minWidth: 200,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Opción: Editar perfil */}
              <MenuItem onClick={handleEditProfile}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>Editar Perfil</ListItemText>
              </MenuItem>

              <Divider />

              {/* Opción: Cerrar sesión */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Si no hay sesión, mostrar botones de login y registro
          <>
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Registrarse
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
