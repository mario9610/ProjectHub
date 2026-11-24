if (getToken()) {
    window.location.replace("home.html");
}

const form = document.getElementById("form-registro");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btn-registro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(mensaje);

    const name = document.getElementById("nombre").value.trim();
    const email = document.getElementById("correo").value.trim();
    const itsonId = document.getElementById("itsonId").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // Validaciones según la documentación de la API
    if (name.length < 6) {
        return showMessage(mensaje, "El nombre debe tener al menos 6 caracteres.");
    }
    if (!/^\d{6}$/.test(itsonId)) {
        return showMessage(mensaje, "El ID ITSON debe tener exactamente 6 números.");
    }
    if (password.length < 6) {
        return showMessage(mensaje, "La contraseña debe tener al menos 6 caracteres.");
    }
    if (password !== confirmar) {
        return showMessage(mensaje, "Las contraseñas no coinciden.");
    }

    boton.disabled = true;
    boton.textContent = "Registrando...";

    try {
        await apiRequest("/auth/register", {
            method: "POST",
            body: { name, email, itsonId, password },
        });
        window.location.href = "index.html?registrado=1";
    } catch (err) {
        showMessage(mensaje, err.message);
        boton.disabled = false;
        boton.textContent = "Registrarse";
    }
});
