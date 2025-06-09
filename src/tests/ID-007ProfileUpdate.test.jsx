import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { it, vi } from "vitest"
import Perfil from "../pages/Perfil"

// Mock de firebase/auth con getAuth
vi.mock("firebase/auth", () => {
  return {
    getAuth: () => ({
      currentUser: {
        uid: "abc123",
        displayName: "",
        photoURL: "",
      },
    }),
  }
})

// Mock de firebase/firestore
vi.mock("firebase/firestore", async () => {
  const original = await vi.importActual("firebase/firestore")
  return {
    ...original,
    doc: vi.fn(),
    getDoc: vi.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          nombre: "Juan",
          apellidos: "Pérez",
          direccion: "Calle Falsa 123",
          provincia: "Madrid",
          telefono: "600123123",
          dni: "12345678Z",
          imagen: "/juan.jpg",
        }),
      })
    ),
    updateDoc: vi.fn(() => Promise.resolve()),
  }
})

// Mock de firebase/storage
vi.mock("firebase/storage", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getStorage: () => ({}),
    ref: vi.fn(),
    uploadBytes: vi.fn(() => Promise.resolve()),
    getDownloadURL: vi.fn(() => Promise.resolve("/nueva.jpg")),
  }
})


// Mock de notistack
const mockSnackbar = vi.fn()
vi.mock("notistack", () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockSnackbar,
  }),
}))

it("Permite editar y guardar cambios en el perfil", async () => {
  render(
    <BrowserRouter>
      <Perfil />
    </BrowserRouter>
  )

  // Espera a que cargue el nombre original
  await waitFor(() => screen.getByDisplayValue("Juan"))

  // Modificar el nombre
  fireEvent.change(screen.getByLabelText(/nombre/i), {
    target: { value: "Carlos" },
  })

  // Pulsar el botón para guardar cambios
  fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }))

  // Esperar al snackbar de éxito (mockSnackbar debe ser llamado)
  await waitFor(() => {
    const mensajes = mockSnackbar.mock.calls.map(([msg]) => msg)
    if (!mensajes.some((m) => m.includes("Perfil actualizado"))) {
      throw new Error("No se encontró mensaje de confirmación")
    }
  })
})
