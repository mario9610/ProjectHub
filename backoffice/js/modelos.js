
export class Usuario {
    id;

    constructor(nombre, email, itsonId, password = "") {
        this.nombre = nombre;
        this.email = email;
        this.itsonId = itsonId;
        this.password = password;
    }

    // Formato que espera POST /auth/register
    toApi() {
        return {
            name: this.nombre,
            email: this.email,
            itsonId: this.itsonId,
            password: this.password,
        };
    }

    // Convierte lo que responde la API en un objeto Usuario
    static desdeApi(datos) {
        const usuario = new Usuario(datos.name, datos.email, datos.itsonId);
        usuario.id = datos.id || datos._id;
        return usuario;
    }
}

export class Proyecto {
    id;
    userId;

    constructor(titulo, descripcion, tecnologias = [], repositorio = "", imagenes = []) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tecnologias = tecnologias;
        this.repositorio = repositorio;
        this.imagenes = imagenes;
    }

    // Formato que esperan POST /projects y PUT /projects/:id
    toApi() {
        const datos = {
            title: this.titulo,
            description: this.descripcion,
            technologies: this.tecnologias,
            repository: this.repositorio,
            images: this.imagenes,
        };
        if (this.userId) datos.userId = this.userId;
        return datos;
    }

    // Convierte lo que responde la API en un objeto Proyecto
    static desdeApi(datos) {
        const proyecto = new Proyecto(
            datos.title,
            datos.description,
            datos.technologies || [],
            datos.repository || "",
            datos.images || []
        );
        proyecto.id = datos._id;
        proyecto.userId = datos.userId;
        return proyecto;
    }
}
