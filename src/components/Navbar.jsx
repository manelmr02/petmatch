import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

import logo from '../assets/logoPetMatchNoBg.png';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
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
        <Button color="inherit" component={Link} to="/">Inicio</Button>
        <Button color="inherit" component={Link} to="/mascotas">Mascotas</Button>
        <Button color="inherit" component={Link} to="/login">Iniciar Sesión</Button>
        <Button color="inherit" component={Link} to="/register">Registrarse</Button>
      </Toolbar>
    </AppBar>
  );
}