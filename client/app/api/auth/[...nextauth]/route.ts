import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "email", placeholder: "test@test.com" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials, req) {
                try {
                    const res = await fetch(
                        `http://localhost:3001/api/login`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                email: credentials?.email,
                                password: credentials?.password,
                            }),
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                    const user = await res.json();

                    if (user.error) throw new Error("Usuario no encontrado");

                    return user;

                } catch (error: any) {
                    throw new Error("Error al procesar la solicitud")
                }             
            }
        })
    ],
    session: {
        //maxAge: 1*60
    },
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
        async session({ session, token }) {
            session.user = token as any;
            return session;
        },
    },
    pages: {
        signIn: "/login"
    },
});

export { handler as GET, handler as POST }
