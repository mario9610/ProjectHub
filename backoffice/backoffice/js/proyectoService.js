import { apiRequest } from "./api.js";
import { Proyecto } from "./modelos.js";

// CRUD de proyectos. Todas las rutas son protegidas: mandan el token en el header.
export class ProyectoService {
    constructor(authService) {
        this.auth = authService;
    }

    // GET /projects
    async obtenerTodos() {
        const data = await apiRequest("/projects", { token: this.auth.getToken() });
        const lista = Array.isArray(data) ? data : (data && data.projects) || [];
        return lista.map((p) => Proyecto.desdeApi(p));
    }

    // POST /projects
    async crear(proyecto) {
        proyecto.userId = this.auth.getUserId();
        return apiRequest("/projects", { method: "POST", body: proyecto.toApi(), token: this.auth.getToken() });
    }

    // PUT /projects/:id
    async actualizar(id, proyecto) {
        return apiRequest("/projects/" + id, { method: "PUT", body: proyecto.toApi(), token: this.auth.getToken() });
    }

    // DELETE /projects/:id
    async eliminar(id) {
        return apiRequest("/projects/" + id, { method: "DELETE", token: this.auth.getToken() });
    }
}
