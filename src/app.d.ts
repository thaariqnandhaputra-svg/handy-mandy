// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export type Role = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
        role: Role;
        phone: string | null;
      } | null;
      sessionId: string | null;
    }
    interface PageData {
      user?: App.Locals['user'];
    }
    interface Error {
      message: string;
      code?: string;
    }
  }
}

export {};

