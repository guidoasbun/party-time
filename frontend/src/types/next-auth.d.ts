import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    idToken?: string
  }

  interface DefaultSession {
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    idToken?: string
  }
}