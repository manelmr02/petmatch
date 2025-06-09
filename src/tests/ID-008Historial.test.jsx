import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MisSolicitudes from '../pages/MisSolicitudes'

// Mock Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (cb) => {
    cb({ uid: '123' })
    return () => {}
  },
  auth: {}
}))

// Mock Firestore
vi.mock('firebase/firestore', () => {
  const solicitudes = [
    {
      id: 'solic1',
      mascotaNombre: 'Firulais',
      estado: 'pendiente',
      refugioNombre: 'Refugio Central'
    }
  ]
  return {
    doc: () => ({}),
    getDoc: () => Promise.resolve({ exists: () => true, data: () => ({ rol: 'adoptante' }) }),
    collection: () => ({}),
    where: () => ({}),
    query: () => ({}),
    onSnapshot: (q, cb) => {
      cb({ docs: solicitudes.map((s) => ({ id: s.id, data: () => s })) })
      return () => {}
    },
    updateDoc: () => Promise.resolve()
  }
})

// Mock Snackbar
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() })
}))

describe('Historial de solicitudes', () => {
  it('muestra solicitudes asociadas al usuario', async () => {
    render(
      <BrowserRouter>
        <MisSolicitudes />
      </BrowserRouter>
    )

    await waitFor(() => {
      const texto = screen.getByText(/firulais/i)
      if (!texto) throw new Error('No se cargó el historial de solicitudes')
    })
  })
})
