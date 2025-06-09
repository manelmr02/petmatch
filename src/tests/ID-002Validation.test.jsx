import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '../pages/Register'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { vi, test } from 'vitest'

// Mock firebase/auth
vi.mock('firebase/auth', async (importOriginal) => {
    const mod = await importOriginal()
    return {
        ...mod,
        getAuth: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(() => Promise.reject()),

    }
})


// Mock firestore
vi.mock('firebase/firestore', async (importOriginal) => {
    const mod = await importOriginal()
    return {
        ...mod,
        getFirestore: vi.fn(),
        doc: vi.fn(),
        setDoc: vi.fn(),
    }
})

// Mock storage
vi.mock('firebase/storage', async (importOriginal) => {
    const mod = await importOriginal()
    return {
        ...mod,
        getStorage: vi.fn(),
        ref: vi.fn(),
        uploadBytes: vi.fn(),
        getDownloadURL: vi.fn(),
    }
})

// Mock ../firebase
vi.mock('../firebase', () => ({
    auth: {},
    db: {},
    storage: {},
}))

// Mock notistack
const mockSnackbar = vi.fn()
vi.mock('notistack', async (importOriginal) => {
    const mod = await importOriginal()
    return {
        ...mod,
        useSnackbar: () => ({ enqueueSnackbar: mockSnackbar }),
    }
})

test('Registro duplicado > muestra error si el email ya está en uso', async () => {
    render(
        <BrowserRouter>
            <SnackbarProvider>
                <Register />
            </SnackbarProvider>
        </BrowserRouter>
    )

    // Rellenar campos válidos para que pase las validaciones internas
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'López' } })
    fireEvent.change(screen.getByLabelText(/dni/i), { target: { value: '12345678Z' } })
    fireEvent.change(screen.getByPlaceholderText('1 (702) 123-4567'), { target: { value: '+34111222333' } })
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Calle Falsa 123' } })
    fireEvent.change(screen.getByPlaceholderText('Selecciona una provincia...'), { target: { value: 'Madrid' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'duplicado@example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } })

    // Hacer submit
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    // Verificamos manualmente si se llamó al snackbar con el mensaje
    await waitFor(() => {
        if (!mockSnackbar.mock.calls.length) throw new Error('Snackbar no llamado')
        const llamada = mockSnackbar.mock.calls.find(([msg]) =>
            msg.includes('ya está en uso')
        )
        if (!llamada) throw new Error('No se encontró mensaje de email duplicado')
    })
})
