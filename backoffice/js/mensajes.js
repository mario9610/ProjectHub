export function mostrarMensaje(el, texto, tipo = "error") {
    el.textContent = texto;
    el.className = "form-message " + tipo;
    el.hidden = false;
}

export function ocultarMensaje(el) {
    el.hidden = true;
    el.textContent = "";
}
