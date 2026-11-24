import { apiRequest } from "./api.js";
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
            throw new Error("La API no devolvió un token.");
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

}
