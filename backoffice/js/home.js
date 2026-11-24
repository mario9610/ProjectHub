// ===== Protección: sin token no se entra =====
if (!requireAuth()) {
    throw new Error("Sin sesión");
}

const lista = document.getElementById("lista-proyectos");
const vacio = document.getElementById("proyectos-vacio");
const avisoLista = document.getElementById("mensaje-lista");
const modal = document.getElementById("modal-proyecto");
const form = document.getElementById("form-proyecto");
const mensajeForm = document.getElementById("mensaje-form");
const tituloModal = document.getElementById("modal-titulo");
const btnGuardar = document.getElementById("btn-guardar");

let proyectos = [];
let editandoId = null;

// ---- Usuario ----
const usuario = getUser();
if (usuario && usuario.name) {
    document.getElementById("nombre-usuario").textContent = usuario.name;
}

// El API pide userId al crear; sale del usuario guardado o del token (JWT)
function obtenerUserId() {
    if (usuario && (usuario.id || usuario._id)) return usuario.id || usuario._id;
    try {
        const payload = JSON.parse(atob(getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload._id || payload.id || payload.userId;
    } catch {
        return undefined;
    }
}

// ---- Cerrar sesión ----
document.getElementById("cerrar-sesion").addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location.replace("index.html");
});

// ---- Leer (Read) ----
async function cargarProyectos() {
    hideMessage(avisoLista);
    try {
        const data = await apiRequest("/projects", { auth: true });
        proyectos = Array.isArray(data) ? data : (data && data.projects) || [];
        pintarProyectos();
    } catch (err) {
        showMessage(avisoLista, err.message);
    }
}

function pintarProyectos() {
    lista.replaceChildren();
    vacio.hidden = proyectos.length > 0;

    proyectos.forEach((p) => lista.appendChild(crearTarjeta(p)));
}

// Se usa textContent en todo para evitar inyección de HTML
function el(tag, className, text) {
    const nodo = document.createElement(tag);
    if (className) nodo.className = className;
    if (text !== undefined) nodo.textContent = text;
    return nodo;
}

function crearTarjeta(p) {
    const card = el("article", "project-card");

    if (Array.isArray(p.images) && p.images.length > 0) {
        const img = el("img", "project-card-img");
        img.src = p.images[0];
        img.alt = "Imagen de " + p.title;
        img.loading = "lazy";
        img.addEventListener("error", () => img.remove());
        card.appendChild(img);
    }

    const cuerpo = el("div", "project-card-body");
    cuerpo.appendChild(el("h3", null, p.title));
    cuerpo.appendChild(el("p", "project-desc", p.description));

    if (Array.isArray(p.technologies) && p.technologies.length > 0) {
        const tags = el("div", "tags");
        p.technologies.forEach((t) => tags.appendChild(el("span", "tag", t)));
        cuerpo.appendChild(tags);
    }

    if (p.repository) {
        const a = el("a", "repo-link", "Ver repositorio");
        a.href = p.repository;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        cuerpo.appendChild(a);
    }

    const acciones = el("div", "card-actions");
    const btnEditar = el("button", "btn-secondary", "Actualizar");
    btnEditar.type = "button";
    btnEditar.addEventListener("click", () => abrirModal(p));

    const btnEliminar = el("button", "btn-danger", "Eliminar");
    btnEliminar.type = "button";
    btnEliminar.addEventListener("click", () => eliminarProyecto(p));

    acciones.append(btnEditar, btnEliminar);
    cuerpo.appendChild(acciones);
    card.appendChild(cuerpo);
    return card;
}

// ---- Modal (agregar / actualizar) ----
function abrirModal(proyecto) {
    hideMessage(mensajeForm);
    form.reset();

    if (proyecto) {
        editandoId = proyecto._id;
        tituloModal.textContent = "Actualizar proyecto";
        btnGuardar.textContent = "Guardar cambios";
        document.getElementById("titulo").value = proyecto.title || "";
        document.getElementById("descripcion").value = proyecto.description || "";
        document.getElementById("tecnologias").value = (proyecto.technologies || []).join(", ");
        document.getElementById("repositorio").value = proyecto.repository || "";
        document.getElementById("imagenes").value = (proyecto.images || []).join(", ");
    } else {
        editandoId = null;
        tituloModal.textContent = "Agregar proyecto";
        btnGuardar.textContent = "Guardar proyecto";
    }
    modal.showModal();
}

document.getElementById("btn-agregar").addEventListener("click", () => abrirModal(null));
document.getElementById("btn-cancelar").addEventListener("click", () => modal.close());

// Convierte "a, b, c" en ["a", "b", "c"]
function listaDesdeTexto(texto) {
    return texto.split(",").map((s) => s.trim()).filter(Boolean);
}

// ---- Crear (Create) y Actualizar (Update) ----
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(mensajeForm);

    const proyecto = {
        title: document.getElementById("titulo").value.trim(),
        description: document.getElementById("descripcion").value.trim(),
        technologies: listaDesdeTexto(document.getElementById("tecnologias").value),
        repository: document.getElementById("repositorio").value.trim(),
        images: listaDesdeTexto(document.getElementById("imagenes").value),
    };

    if (!proyecto.title || !proyecto.description) {
        return showMessage(mensajeForm, "El nombre y la descripción son obligatorios.");
    }

    btnGuardar.disabled = true;

    try {
        if (editandoId) {
            await apiRequest("/projects/" + editandoId, { method: "PUT", body: proyecto, auth: true });
        } else {
            proyecto.userId = obtenerUserId();
            await apiRequest("/projects", { method: "POST", body: proyecto, auth: true });
        }
        modal.close();
        await cargarProyectos();
    } catch (err) {
        showMessage(mensajeForm, err.message);
    } finally {
        btnGuardar.disabled = false;
    }
});

// ---- Eliminar (Delete) ----
async function eliminarProyecto(p) {
    if (!confirm("¿Eliminar el proyecto \"" + p.title + "\"? Esta acción no se puede deshacer.")) return;

    try {
        await apiRequest("/projects/" + p._id, { method: "DELETE", auth: true });
        await cargarProyectos();
    } catch (err) {
        showMessage(avisoLista, err.message);
    }
}

cargarProyectos();
