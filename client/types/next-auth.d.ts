import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      nivelUsuario: number;
      codigoPersona: number;
      token: string;
    };
  }
}