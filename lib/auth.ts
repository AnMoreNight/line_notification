import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      version: '2.0',
      authorization: {
        url: 'https://access.line.me/oauth2/v2.1/authorize',
        params: {
          scope: 'profile openid email',
          response_type: 'code',
        },
      },
      token: 'https://api.line.me/oauth2/v2.1/token',
      userinfo: 'https://api.line.me/v2/profile',
      clientId: process.env.LINE_LOGIN_CHANNEL_ID,
      clientSecret: process.env.LINE_LOGIN_CHANNEL_SECRET,
      profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: profile.email,
          image: profile.pictureUrl,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'line') {
        try {
          // Check if user exists in our database
          const existingUser = await prisma.user.findUnique({
            where: { lineUserId: user.id },
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                lineUserId: user.id,
                displayName: user.name || '',
                profilePictureUrl: user.image,
                email: user.email,
                role: 'INDIVIDUAL',
                status: 'PENDING',
              },
            })
          }
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token?.sub) {
        const user = await prisma.user.findUnique({
          where: { lineUserId: token.sub },
          include: { company: true },
        })

        if (user) {
          session.user = {
            id: user.id,
            lineUserId: user.lineUserId,
            name: user.displayName,
            email: user.email,
            image: user.profilePictureUrl,
            role: user.role,
            status: user.status,
            companyId: user.companyId,
            company: user.company,
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
