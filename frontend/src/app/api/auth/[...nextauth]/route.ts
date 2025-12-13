import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getApiBaseUrl } from "@/lib/api-client"

// Detect if running behind CloudFront/ALB (internal HTTP but external HTTPS)
// When NEXTAUTH_URL is set to https://, trust that the proxy handles SSL
const isProduction = process.env.NODE_ENV === 'production'
const useSecureCookies = isProduction && process.env.NEXTAUTH_URL?.startsWith('https://')

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
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
    async signIn({ user, account }) {
      // For Google OAuth, automatically create user in our system
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists in our backend by calling /me endpoint
          // If not, this will serve as a signal that the user was created via OAuth
          return true
        } catch (error) {
          console.error('Error during Google OAuth sign in:', error)
          return false
        }
      }
      
      // For other providers, allow normal flow
      return true
    },
    async jwt({ token, account, user }) {
      // Persist tokens right after signin
      if (account && user) {
        // For Google OAuth, set up token data
        if (account.provider === 'google') {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.idToken = account.id_token
          token.provider = 'google'
          
          // Store user info in token for Google OAuth users
          token.email = user.email
          token.name = user.name
          token.picture = user.image
          token.email_verified = true // Google OAuth users have verified emails
        }
        
        // For other OAuth providers
        else if (account.access_token) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.idToken = account.id_token
          token.provider = account.provider
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
          token.provider = 'credentials'
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.idToken = token.idToken as string
      
      // For Google OAuth users, use token data since we may not have backend integration yet
      if (token.provider === 'google') {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string,
        }
      }
      
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
  cookies: {
    sessionToken: {
      name: useSecureCookies ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        domain: isProduction ? process.env.NEXTAUTH_COOKIE_DOMAIN : undefined,
      }
    },
    callbackUrl: {
      name: useSecureCookies ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      }
    },
    csrfToken: {
      name: useSecureCookies ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      }
    }
  },
  useSecureCookies: useSecureCookies,
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }