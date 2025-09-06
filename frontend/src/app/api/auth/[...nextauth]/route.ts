import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      checks: ["pkce", "state"],
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // For credentials authentication, we'll use AWS Cognito's InitiateAuth
          // This requires implementing the backend authentication flow
          // For now, we'll call our backend to authenticate
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            throw new Error('Authentication failed')
          }

          const data = await response.json()
          
          if (data.access_token) {
            return {
              id: data.user_id || data.sub,
              email: credentials.email,
              name: data.name || data.given_name,
              accessToken: data.access_token,
              idToken: data.id_token,
              refreshToken: data.refresh_token,
            }
          }

          return null
        } catch (error) {
          console.error('Credentials authentication failed:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist tokens right after signin
      if (account && user) {
        // For OAuth providers
        if (account.access_token) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.idToken = account.id_token
        }
        
        // For credentials provider
        const userWithTokens = user as typeof user & {
          accessToken?: string
          refreshToken?: string
          idToken?: string
        }
        if (userWithTokens.accessToken) {
          token.accessToken = userWithTokens.accessToken
          token.refreshToken = userWithTokens.refreshToken
          token.idToken = userWithTokens.idToken
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.idToken = token.idToken as string
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }