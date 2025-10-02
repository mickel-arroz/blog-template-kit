import { z } from 'zod';

/**
 * Post domain schema (shared client/server) - normalized structure.
 * Markdown/HTML content is stored in `content` (raw) and MAY be sanitized before render.
 */
export const PostStatusSchema = z.enum(['draft', 'published', 'archived']);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const PostIdSchema = z.string().uuid();

export const PostBaseSchema = z.object({
  id: PostIdSchema.optional(), // optional when creating
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Slug inválido')
    .describe('URL-friendly identifier'),
  title: z.string().min(3).max(180),
  // excerpt puede venir null desde la BD; lo normalizamos a ''
  excerpt: z
    .string()
    .max(300)
    .nullable()
    .optional()
    .transform((v) => v ?? '')
    .default(''),
  content: z.string().min(1, 'Contenido requerido'),
  // coverImage opcional y puede almacenarse como null en la BD
  coverImage: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(25).default([]),
  status: PostStatusSchema.default('draft'),
  publishedAt: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Input schema for creation (no id, timestamps auto)
export const CreatePostSchema = PostBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  publishedAt: z.date().optional().nullable(),
});

// Input schema for updates (id required, partial allowed except slug immutability optional rule)
export const UpdatePostSchema = PostBaseSchema.partial().extend({
  id: PostIdSchema,
  slug: PostBaseSchema.shape.slug.optional(),
});

// Output schema (read model)
export const PostSchema = PostBaseSchema;
export type Post = z.infer<typeof PostSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

export const PostListQuerySchema = z.object({
  q: z.string().min(1).max(120).optional(),
  tag: z.string().min(1).max(40).optional(),
  status: PostStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});
export type PostListQuery = z.infer<typeof PostListQuerySchema>;
