/**
 * Centraliza paths de API para evitar strings sueltos y facilitar cambios futuros.
 */
export const ApiRoutes = {
  admin: {
    posts: {
      root: '/api/admin/posts',
    },
  },
  client: {
    posts: {
      root: '/api/posts',
    },
  },
} as const;

export type ApiRoutePaths = typeof ApiRoutes;
