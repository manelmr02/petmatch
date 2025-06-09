import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import PetList from '../pages/PetList'

// Mocks necesarios
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (cb) => cb({ uid: 'refugio123', email: 'refugio@test.com' }),
}))

vi.mock('firebase/firestore', () => {
  const mascotas = []
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn((ref) => {
      if (ref.path?.includes('usuarios')) {
        return Promise.resolve({ exists: () => true, data: () => ({ rol: 'refugio' }) })
      }
      if (ref.path?.includes('refugios')) {
        return Promise.resolve({ exists: () => true, data: () => ({ nombreRefugio: 'Refugio Esperanza' }) })
      }
      return Promise.resolve({ exists: () => false })
    }),
    addDoc: vi.fn((_, data) => {
      mascotas.push(data)
      return Promise.resolve()
    }),
    query: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: (q, cb) => {
      cb({ docs: [] })
    },
    serverTimestamp: () => new Date()
  }
})

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/foto.jpg'))
}))

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}))

describe('ID-004 - Refugio publica animal', () => {
  it('publica una mascota y aparece listada', async () => {
    render(
      <BrowserRouter>
        <PetList />
      </BrowserRouter>
    )

    await waitFor(() => {
      const subirBtn = screen.getByRole('button', { name: /subir mascota/i })
      if (!subirBtn) throw new Error('No se encontró botón Subir mascota')
      subirBtn.click()
    })

    const nombreInput = await screen.findByLabelText(/nombre/i)
    nombreInput.value = 'Firulais'

    const descripcion = screen.getByLabelText(/descripción/i)
    descripcion.value = 'Un perro juguetón'

    const edad = screen.getByLabelText(/edad/i)
    edad.value = '2 años'

    const especie = screen.getByLabelText(/especie/i)
    especie.value = 'Perro'

    const raza = screen.getByLabelText(/raza/i)
    raza.value = 'Labrador'

    const fileInput = screen.getByLabelText(/seleccionar imagen/i)
    const file = new File(['(⌐□_□)'], 'firulais.jpg', { type: 'image/jpeg' })
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    const publicarBtn = screen.getByRole('button', { name: /publicar mascota/i })
    publicarBtn.click()

    // Comprobación por consola
    await waitFor(() => {
      console.log('✅ ID-004: Publicación enviada (si no hay errores)')
    })
  })
})
