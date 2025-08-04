import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      country?: string;
      currency?: string;
      clinicName?: string;
      clinicProfile?: string;
      requirePasswordChange?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    country?: string;
    currency?: string;
    clinicName?: string;
    clinicProfile?: string;
    requirePasswordChange?: boolean;
    createdBy?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    country?: string;
    currency?: string;
    clinicName?: string;
    clinicProfile?: string;
    requirePasswordChange?: boolean;
    createdBy?: string;
  }
}