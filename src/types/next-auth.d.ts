import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    timezone: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      timezone: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    timezone: string;
  }
}
