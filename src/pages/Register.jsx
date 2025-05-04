import { useState } from 'react';
import { TextField, Button, Container, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('adoptante'); // por defecto
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Guardamos datos extra en Firestore
      await setDoc(doc(db, "usuarios", uid), {
        email,
        tipo
      });

      alert('¡Registro exitoso!');
      navigate('/mascotas');
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
        <FormControl fullWidth margin="normal">
          <InputLabel id="tipo-label">Tipo de usuario</InputLabel>
          <Select
            labelId="tipo-label"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            label="Tipo de usuario"
          >
            <MenuItem value="adoptante">Adoptante</MenuItem>
            <MenuItem value="refugio">Refugio</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>
          Registrarse
        </Button>
      </form>
    </Container>
  );
}
