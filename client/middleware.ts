export { default } from "next-auth/middleware";

//Especifica las rutas que se van a proteger
export const config = {
    matcher: [
        "/inicio",
        "/administrador/:path*", 
        "/docente/:path*",
        "/estudiante/:path*",
        "/jefatura/:path*",
        "/manuales-usuario/:path*",
        "/perfil/:path*",
        "/tesoreria/:path*"
    ]
}