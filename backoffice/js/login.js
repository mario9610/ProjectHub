import { AuthService } from "./authService.js";
import { mostrarMensaje, ocultarMensaje } from "./mensajes.js";

const authService = new AuthService();

if (authService.estaLogeado()) {
    window.location.replace("home.html");
}

const formulario = document.getElementById("form-login");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btn-login");

formulario.addEventListener("submit", login);

if (new URLSearchParams(window.location.search).get("registrado") === "1") {
    mostrarMensaje(mensaje, "Cuenta creada. Ya puedes iniciar sesión.", "success");
}

async function login(event) {
    event.preventDefault();
    ocultarMensaje(mensaje);

    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    boton.disabled = true;
    boton.textContent = "Ingresando...";

    try {
        await authService.login(email, password);
        window.location.href = "home.html";
    } catch (err) {
        if (err.status === 401) {
            mostrarMensaje(mensaje, "Correo o contraseña incorrectos.");
        } else {
            mostrarMensaje(mensaje, err.message);
        }
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
    }
}
