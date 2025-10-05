import { z } from 'zod';

export const PageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type PageQuery = z.infer<typeof PageQuerySchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// Admin posts list query (server-side filtering)
import { PostStatusSchema } from './post';
export const AdminPostsQuerySchema = PageQuerySchema.extend({
  q: z.string().min(1).max(120).optional(),
  status: PostStatusSchema.optional(),
});
export type AdminPostsQuery = z.infer<typeof AdminPostsQuerySchema>;
