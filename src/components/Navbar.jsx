import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

import logo from '../assets/logoPetMatchFinal.png';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
      <img src={logo} alt="PetMatch logo" style={{ height: 60, marginRight: 10 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
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