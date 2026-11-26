import { AuthService } from "./authService.js";
import { ProyectoService } from "./proyectoService.js";
import { Proyecto } from "./modelos.js";
import { mostrarMensaje, ocultarMensaje } from "./mensajes.js";

const authService = new AuthService();
const proyectoService = new ProyectoService(authService);

// Protección: sin token no se entra al home
if (!authService.estaLogeado()) {
    window.location.replace("index.html");
} else {
    iniciar();
}

function iniciar() {
    const lista = document.getElementById("lista-proyectos");
    const vacio = document.getElementById("proyectos-vacio");
    const avisoLista = document.getElementById("mensaje-lista");
    const modal = document.getElementById("modal-proyecto");
    const formulario = document.getElementById("form-proyecto");
    const mensajeForm = document.getElementById("mensaje-form");
    const tituloModal = document.getElementById("modal-titulo");
    const btnGuardar = document.getElementById("btn-guardar");

    let proyectos = [];
    let editandoId = null;


    // Cerrar sesión: borra el token y regresa al login
    document.getElementById("cerrar-sesion").addEventListener("click", (event) => {
        event.preventDefault();
        cerrarSesion();
    });

    function cerrarSesion() {
        authService.cerrarSesion();
        window.location.replace("index.html");
    }

    // Si el token venció o no es válido, se cierra la sesión
    function manejarError(err, el) {
        if (err.status === 401 || err.status === 403) {
            return cerrarSesion();
        }
        mostrarMensaje(el, err.message);
    }

    // ---- Leer (Read) ----
    async function cargarProyectos() {
        ocultarMensaje(avisoLista);
        try {
            proyectos = await proyectoService.obtenerTodos();
            pintarProyectos();
        } catch (err) {
            manejarError(err, avisoLista);
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

        if (p.imagenes.length > 0) {
            const img = el("img", "project-card-img");
            img.src = p.imagenes[0];
            img.alt = "Imagen de " + p.titulo;
            img.loading = "lazy";
            img.addEventListener("error", () => img.remove());
            card.appendChild(img);
        }

        const cuerpo = el("div", "project-card-body");
        cuerpo.appendChild(el("h3", null, p.titulo));
        cuerpo.appendChild(el("p", "project-desc", p.descripcion));

        if (p.tecnologias.length > 0) {
            const tags = el("div", "tags");
            p.tecnologias.forEach((t) => tags.appendChild(el("span", "tag", t)));
            cuerpo.appendChild(tags);
        }

        if (p.repositorio) {
            const a = el("a", "repo-link", "Ver repositorio");
            a.href = p.repositorio;
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
        ocultarMensaje(mensajeForm);
        formulario.reset();

        if (proyecto) {
            editandoId = proyecto.id;
            tituloModal.textContent = "Actualizar proyecto";
            btnGuardar.textContent = "Guardar cambios";
            document.getElementById("titulo").value = proyecto.titulo;
            document.getElementById("descripcion").value = proyecto.descripcion;
            document.getElementById("tecnologias").value = proyecto.tecnologias.join(", ");
            document.getElementById("repositorio").value = proyecto.repositorio;
            document.getElementById("imagenes").value = proyecto.imagenes.join(", ");
        } else {
            editandoId = null;
            tituloModal.textContent = "Agregar proyecto";
            btnGuardar.textContent = "Guardar proyecto";
        }
        modal.showModal();
    }

    document.getElementById("btn-agregar").addEventListener("click", () => abrirModal(null));
    document.getElementById("btn-cancelar").addEventListener("click", () => modal.close());


    function listaDesdeTexto(texto) {
        return texto.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // ---- Crear y Actualizar ----
    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();
        ocultarMensaje(mensajeForm);

        const proyecto = new Proyecto(
            document.getElementById("titulo").value.trim(),
            document.getElementById("descripcion").value.trim(),
            listaDesdeTexto(document.getElementById("tecnologias").value),
            document.getElementById("repositorio").value.trim(),
            listaDesdeTexto(document.getElementById("imagenes").value)
        );

        if (!proyecto.titulo || !proyecto.descripcion) {
            return mostrarMensaje(mensajeForm, "El nombre y la descripción son obligatorios.");
        }

        btnGuardar.disabled = true;

        try {
            if (editandoId) {
                await proyectoService.actualizar(editandoId, proyecto);
            } else {
                await proyectoService.crear(proyecto);
            }
            modal.close();
            await cargarProyectos();
        } catch (err) {
            manejarError(err, mensajeForm);
        } finally {
            btnGuardar.disabled = false;
        }
    });

    // ---- Eliminar (Delete) ----
    async function eliminarProyecto(p) {
        if (!confirm("¿Eliminar el proyecto \"" + p.titulo + "\"? Esta acción no se puede deshacer.")) return;

        try {
            await proyectoService.eliminar(p.id);
            await cargarProyectos();
        } catch (err) {
            manejarError(err, avisoLista);
        }
    }

    cargarProyectos();
}
