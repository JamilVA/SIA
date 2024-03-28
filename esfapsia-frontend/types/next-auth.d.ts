import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      nivelUsuario: number;
      codigoPersona: number;
      codigoDocente: number;
      codigoJefe: number;
      codigoEstudiante: number;
      token: string;
    };
  }
}
