import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock de notistack
vi.mock('notistack', () => ({
    useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}));

// Mock de Firebase
vi.mock('firebase/auth', () => ({
    getAuth: () => ({}),
    createUserWithEmailAndPassword: vi.fn(() =>
        Promise.resolve({ user: { uid: 'test123' } })
    ),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: () => ({}),
    doc: vi.fn(),
    setDoc: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/storage', () => ({
    getStorage: () => ({}),
    ref: vi.fn(),
    uploadBytes: vi.fn(() => Promise.resolve()),
    getDownloadURL: vi.fn(() =>
        Promise.resolve('https://fakeurl.com/image.jpg')
    ),
}));

test('Registro de usuario > registro exitoso redirige a /mascotas', async () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
        target: { value: 'Juan' }
    });

    fireEvent.change(screen.getByLabelText(/apellidos/i), {
        target: { value: 'Pérez' }
    });

    fireEvent.change(screen.getByLabelText(/dni/i), {
        target: { value: '12345678Z' }
    });

    fireEvent.change(screen.getByLabelText(/dirección/i), {
        target: { value: 'Calle Falsa 123' }
    });

    fireEvent.change(screen.getByLabelText(/correo/i), {
        target: { value: 'juan@test.com' }
    });

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: '123456' }
    });

    const inputProvincia = screen.getByLabelText(/provincia/i);
    fireEvent.change(inputProvincia, { target: { value: 'Madrid' } });

    // Simulamos teléfono directamente en el state
    const phoneInput = screen.getByRole('textbox', { name: '' });

    fireEvent.change(phoneInput, { target: { value: '+34666666666' } });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
        if (!mockNavigate.mock.calls.length) {
            throw new Error('navigate no llamado');
        }
        const call = mockNavigate.mock.calls.find(([arg]) => arg === '/mascotas');
        if (!call) throw new Error('navigate no recibió /mascotas');
    });
});
