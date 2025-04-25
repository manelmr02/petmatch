import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
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