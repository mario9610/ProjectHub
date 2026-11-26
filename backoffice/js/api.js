export const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

// Error con el código HTTP, para poder detectar sesiones vencidas
export class ApiError extends Error {
    constructor(mensaje, status) {
        super(mensaje);
        this.status = status;
    }
}

// Hace la petición y devuelve el JSON. Si se manda token, va en el header auth-token
export async function apiRequest(path, { method = "GET", body, token } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token !== undefined) headers["auth-token"] = token || "";

    let res;
    try {
        res = await fetch(API_BASE + path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError("No se pudo conectar con el servidor. Revisa tu internet.", 0);
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        // la respuesta no traía JSON
    }

    if (!res.ok) {
        const mensaje = (data && (data.message || data.error)) || "Ocurrió un error (" + res.status + ")";
        throw new ApiError(mensaje, res.status);
    }
    return data;
}
