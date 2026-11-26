import { apiRequest, ApiError } from "./api.js";
import { Usuario } from "./modelos.js";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export class AuthService {
    async registrar(usuario) {
        return apiRequest("/auth/register", { method: "POST", body: usuario.toApi() });
    }

    async login(email, password) {
        const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });

        if (!data || !data.token) {
            throw new ApiError("La API no devolvió un token.", 0);
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data;
    }

    cerrarSesion() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    estaLogeado() {
        return !!this.getToken();
    }

    getUsuario() {
        try {
            const datos = JSON.parse(localStorage.getItem(USER_KEY));
            return datos ? Usuario.desdeApi(datos) : null;
        } catch {
            return null;
        }
    }

    // El API pide userId al crear un proyecto: sale del usuario guardado o del token
    getUserId() {
        const usuario = this.getUsuario();
        if (usuario && usuario.id) return usuario.id;
        try {
            const payload = JSON.parse(atob(this.getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            return payload._id || payload.id || payload.userId;
        } catch {
            return undefined;
        }
    }
}
