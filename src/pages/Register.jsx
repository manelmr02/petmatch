import { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('¡Registro exitoso!');
      navigate('/mascotas'); // Redirige a la vista de mascotas después de registrarse
    } catch (error) {
      alert('Error en el registro: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Crear cuenta</Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>
          Registrarse
        </Button>
      </form>
    </Container>
  );
}
