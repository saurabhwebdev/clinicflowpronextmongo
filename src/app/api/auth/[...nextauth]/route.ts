import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            country: user.country,
            currency: user.currency,
            clinicName: user.clinicName,
            clinicProfile: user.clinicProfile,
            requirePasswordChange: user.requirePasswordChange,
            createdBy: user.createdBy?.toString(),
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.address = user.address;
        token.country = user.country;
        token.currency = user.currency;
        token.clinicName = user.clinicName;
        token.clinicProfile = user.clinicProfile;
        token.requirePasswordChange = user.requirePasswordChange;
        token.createdBy = user.createdBy;
      }
      
      // Handle session updates (like when profile is changed)
      if (trigger === "update" && session) {
        // Update all possible fields from session
        if (session.requirePasswordChange !== undefined) {
          token.requirePasswordChange = session.requirePasswordChange;
        }
        if (session.firstName !== undefined) {
          token.firstName = session.firstName;
        }
        if (session.lastName !== undefined) {
          token.lastName = session.lastName;
        }
        if (session.phone !== undefined) {
          token.phone = session.phone;
        }
        if (session.address !== undefined) {
          token.address = session.address;
        }
        if (session.country !== undefined) {
          token.country = session.country;
        }
        if (session.currency !== undefined) {
          token.currency = session.currency;
        }
        if (session.clinicName !== undefined) {
          token.clinicName = session.clinicName;
        }
        if (session.clinicProfile !== undefined) {
          token.clinicProfile = session.clinicProfile;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (token.sub) {
          // Ensure sub is defined before assignment
          session.user.id = token.sub as string;
        }
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.country = token.country;
        session.user.currency = token.currency;
        session.user.clinicName = token.clinicName;
        session.user.clinicProfile = token.clinicProfile;
        session.user.requirePasswordChange = token.requirePasswordChange;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };