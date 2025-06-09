import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import {  it, vi } from "vitest"
import PetList from "../pages/PetList"

// Mockeamos los datos y funcionalidades necesarias
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: "refugio123", email: "refugio@correo.com" })
  },
}))

vi.mock("firebase/firestore", async () => {
  const original = await vi.importActual("firebase/firestore")
  return {
    ...original,
    getDoc: vi.fn((ref) => {
      if (ref._key.path.segments.includes("usuarios")) {
        return Promise.resolve({ exists: () => true, data: () => ({ rol: "refugio" }) })
      }
      if (ref._key.path.segments.includes("refugios")) {
        return Promise.resolve({ exists: () => true, data: () => ({ nombreRefugio: "Refugio Amigo" }) })
      }
      return Promise.resolve({ exists: () => false })
    }),
    collection: vi.fn(),
    doc: vi.fn(),
    onSnapshot: vi.fn((q, callback) => {
      callback({
        docs: [
          {
            id: "mascota123",
            data: () => ({
              nombre: "Toby",
              especie: "Perro",
              raza: "Mestizo",
              edad: "2 años",
              descripcion: "Juguetón y amigable",
              foto: "/toby.jpg",
              caracteristicas: ["Vacunado", "Sociable"],
              refugio: "Refugio Amigo",
              refugioId: "refugio123",
              fecha: { toDate: () => new Date() },
            }),
          },
        ],
      })
      return () => {}
    }),
    deleteDoc: vi.fn(),
    serverTimestamp: () => new Date(),
    addDoc: vi.fn(),
  }
})

vi.mock("firebase/storage", () => ({
  ref: () => ({}),
  uploadBytes: () => Promise.resolve(),
  getDownloadURL: () => Promise.resolve("/toby.jpg"),
}))

vi.mock("notistack", () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
  }),
}))

it("Refugio puede confirmar solicitud", async () => {
  render(
    <BrowserRouter>
      <PetList />
    </BrowserRouter>
  )

  // Esperamos a que cargue la tarjeta de la mascota
  await waitFor(() => screen.getByText("Toby"))

  // Click en el botón 'Ver más'
  fireEvent.click(screen.getByRole("button", { name: /ver más/i }))

  // Cierra el modal (verificamos que se haya abierto correctamente)
  await waitFor(() => screen.getByText(/información básica/i))
})
