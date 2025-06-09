import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import PetList from "../pages/PetList"
import { BrowserRouter } from "react-router-dom"
import { vi, it } from "vitest"

// Mock snackbar
vi.mock("notistack", () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn() }),
}))

// Mock Firebase
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (auth, callback) =>
    callback({ uid: "adoptante123", email: "adoptante@test.com" }),
}))
vi.mock("firebase/firestore", () => {
  const mascota = {
    id: "mascota1",
    nombre: "Toby",
    especie: "Perro",
    raza: "Labrador",
    edad: "2 años",
    descripcion: "Muy juguetón",
    caracteristicas: ["Vacunado"],
    refugio: "Refugio Amigo",
    refugioId: "otroRefugio123",
    foto: "https://via.placeholder.com/300",
    fecha: { toDate: () => new Date() },
  }

  return {
    doc: vi.fn(),
    getDoc: vi.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ rol: "adoptante" }),
      })
    ),
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: (q, callback) => {
      callback({
        docs: [{ id: "mascota1", data: () => mascota }],
      })
      return () => {}
    },
  }
})
vi.mock("firebase/storage", () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(() => Promise.resolve("https://fakeurl.com/foto.jpg")),
}))

it("No muestra botones de editar o borrar para el adoptante", async () => {
  render(
    <BrowserRouter>
      <PetList />
    </BrowserRouter>
  )

  await waitFor(() => {
    const verMas = screen.getByRole("button", { name: /ver más/i })
    fireEvent.click(verMas)
  })

  await waitFor(() => {
    const editar = screen.queryByLabelText("Edit")
    const eliminar = screen.queryByLabelText("Delete")

    if (editar || eliminar) {
      throw new Error("El adoptante no debería ver los botones de editar o eliminar")
    }
  })
})
