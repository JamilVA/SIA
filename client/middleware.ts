import { withAuth } from "next-auth/middleware"

export default withAuth({
    // Matches the pages config in `[...nextauth]`
    pages: {
        signIn: '/login',
        error: '/error',
    }
})

// export { default } from "next-auth/middleware";

// export const config = {
//     matcher: [],
// };