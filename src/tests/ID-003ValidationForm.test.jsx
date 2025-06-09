import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

// Mock de Snackbar
const mockSnackbar = vi.fn();
vi.mock('notistack', () => ({
    useSnackbar: () => ({ enqueueSnackbar: mockSnackbar }),
}));

// Mock de router
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Mock Firebase
vi.mock('firebase/auth', () => ({
    getAuth: () => ({}),
    createUserWithEmailAndPassword: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
    getFirestore: () => ({}),
    doc: vi.fn(),
    setDoc: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
    getStorage: () => ({}),
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
}));

describe('Validaciones de formulario', () => {
    it('muestra errores si se envía con email y DNI inválidos', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/nombre/i), { target: { name: 'nombre', value: 'Ana' } });
        fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { name: 'apellidos', value: 'López' } });
        fireEvent.change(screen.getByLabelText(/dni/i), { target: { name: 'dni', value: 'BAD-DNI' } });
        fireEvent.change(screen.getByLabelText(/correo/i), { target: { name: 'email', value: 'no-es-email' } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { name: 'password', value: '123456' } });
        fireEvent.change(screen.getByLabelText(/dirección/i), { target: { name: 'direccion', value: 'Calle Falsa' } });

        // Provincia con autocomplete
        const provinciaInput = screen.getByLabelText(/provincia/i);
        fireEvent.change(provinciaInput, { target: { value: 'Madrid' } });
        fireEvent.keyDown(provinciaInput, { key: 'Enter', code: 'Enter' });

        // Teléfono inválido
        const telefonoInput = document.querySelector('input[name="telefono"]');
        fireEvent.change(telefonoInput, { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

        await waitFor(() => {
            const errores = mockSnackbar.mock.calls.map(([msg]) => msg);
            console.log('Errores actuales:', errores);
            if (!errores.some((m) => m.includes('Revisa los errores'))) {
                throw new Error('No se encontró el mensaje de error general');
            }
        });

    });

});
