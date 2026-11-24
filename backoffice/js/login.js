// Si ya hay sesión, ir directo al home
if (getToken()) {
    window.location.replace("home.html");
}

const form = document.getElementById("form-login");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("btn-login");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(mensaje);

    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    boton.disabled = true;
    boton.textContent = "Ingresando...";

    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: { email, password },
        });

        if (!data || !data.token) {
            throw new Error("La API no devolvió un token.");
        }

        saveSession(data.token, data.user);
        window.location.href = "home.html";
    } catch (err) {
        showMessage(mensaje, err.message);
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
    }
});

// Aviso cuando llegan desde un registro exitoso
if (new URLSearchParams(window.location.search).get("registrado") === "1") {
    showMessage(mensaje, "Cuenta creada. Ya puedes iniciar sesión.", "success");
}
