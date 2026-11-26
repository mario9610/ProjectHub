import { AuthService } from "./authService.js";
import { Usuario } from "./modelos.js";
import { mostrarMensaje, ocultarMensaje } from "./mensajes.js";

const authService = new AuthService();

if (authService.estaLogeado()) {
    window.location.replace("home.html");
}

const formulario = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btn-registro");

formulario.addEventListener("submit", registrar);

async function registrar(event) {
    event.preventDefault();
    ocultarMensaje(mensaje);

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("correo").value.trim();
    const itsonId = document.getElementById("itsonId").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // Validaciones según la documentación de la API
    if (nombre.length < 6) {
        return mostrarMensaje(mensaje, "El nombre debe tener al menos 6 caracteres.");
    }
    if (!/^\d{6}$/.test(itsonId)) {
        return mostrarMensaje(mensaje, "El ID ITSON debe tener exactamente 6 números.");
    }
    if (password.length < 6) {
        return mostrarMensaje(mensaje, "La contraseña debe tener al menos 6 caracteres.");
    }
    if (password !== confirmar) {
        return mostrarMensaje(mensaje, "Las contraseñas no coinciden.");
    }

    boton.disabled = true;
    boton.textContent = "Registrando...";

    try {
        await authService.registrar(new Usuario(nombre, email, itsonId, password));
        window.location.href = "index.html?registrado=1";
    } catch (err) {
        mostrarMensaje(mensaje, err.message);
        boton.disabled = false;
        boton.textContent = "Registrarse";
    }
}
