// ===== Configuración y utilidades compartidas =====
const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

// ---- Sesión ----
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
}

function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Redirige a login si no hay token guardado
function requireAuth() {
    if (!getToken()) {
        window.location.replace("index.html");
        return false;
    }
    return true;
}

// ---- Mensajes en pantalla ----
function showMessage(el, text, type = "error") {
    el.textContent = text;
    el.className = "form-message " + type;
    el.hidden = false;
}

function hideMessage(el) {
    el.hidden = true;
    el.textContent = "";
}

// ---- Peticiones ----
// Lee el cuerpo como JSON si se puede; si no, devuelve null
async function readBody(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) headers["auth-token"] = getToken() || "";

    let res;
    try {
        res = await fetch(API_BASE + path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor. Revisa tu internet.");
    }

    const data = await readBody(res);

    if (!res.ok) {
        // Token vencido o inválido: se cierra la sesión
        if (auth && (res.status === 401 || res.status === 403)) {
            clearSession();
            window.location.replace("index.html");
        }
        const err = new Error((data && (data.message || data.error)) || "Ocurrió un error (" + res.status + ")");
        err.status = res.status;
        throw err;
    }
    return data;
}
