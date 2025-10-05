import prisma from '@/app/api/lib/prisma/client';
import {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostListQuerySchema,
  type Post,
} from '@/domain/shared/schemas';
import { PostStatus, type Post as DbPost } from '@prisma/client';
import { z } from 'zod';

export const PostsRepositoryErrorSchema = z.object({
  code: z.enum(['NOT_FOUND', 'CONFLICT', 'UNKNOWN']),
  message: z.string(),
});

export type PostsRepositoryError = z.infer<typeof PostsRepositoryErrorSchema>;

interface PrismaKnownErrorLike {
  code: string;
}

function isPrismaError(e: unknown): e is PrismaKnownErrorLike {
  if (typeof e !== 'object' || e === null) return false;
  const maybe = e as Record<string, unknown>;
  return typeof maybe.code === 'string';
}

function mapDbPost(db: DbPost): Post {
  return PostSchema.parse({ ...db, status: db.status.toLowerCase() });
}

export async function listPosts(rawQuery: unknown) {
  const { q, tag, status, limit, cursor } = PostListQuerySchema.parse(rawQuery);
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (tag) where.tags = { has: tag };
  if (status) where.status = status.toUpperCase();

  const results = await prisma.post.findMany({
    where,
    take: limit + 1,
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasNext = results.length > limit;
  const items = results.slice(0, limit).map(mapDbPost);
  return {
    items,
    nextCursor: hasNext ? items[items.length - 1].id : undefined,
  };
}

export async function getPostBySlug(slug: string) {
  const db = await prisma.post.findUnique({ where: { slug } });
  if (!db) return null;
  return mapDbPost(db);
}

export async function createPost(rawInput: unknown) {
  const input = CreatePostSchema.parse(rawInput);
  // enforce unique slug (prisma unique will also enforce)
  try {
    const created = await prisma.post.create({
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt || null,
        content: input.content,
        coverImage: input.coverImage || null,
        tags: input.tags,
        status: (input.status || 'draft').toUpperCase() as PostStatus,
        publishedAt: input.publishedAt || null,
      },
    });
    return mapDbPost(created);
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === 'P2002') {
      const conflict: PostsRepositoryError = {
        code: 'CONFLICT',
        message: 'Slug ya existe',
      };
      throw conflict;
    }
    throw {
      code: 'UNKNOWN',
      message: 'Error creando post',
    } satisfies PostsRepositoryError;
  }
}

export async function updatePost(rawInput: unknown) {
  const input = UpdatePostSchema.parse(rawInput);
  try {
    const updated = await prisma.post.update({
      where: { id: input.id },
      data: {
        ...('slug' in input && input.slug ? { slug: input.slug } : {}),
        ...('title' in input && input.title ? { title: input.title } : {}),
        ...('excerpt' in input ? { excerpt: input.excerpt || null } : {}),
        ...('content' in input && input.content
          ? { content: input.content }
          : {}),
        ...('coverImage' in input
          ? { coverImage: input.coverImage || null }
          : {}),
        ...('tags' in input && input.tags ? { tags: input.tags } : {}),
        ...('status' in input && input.status
          ? { status: input.status.toUpperCase() as PostStatus }
          : {}),
        ...('publishedAt' in input
          ? { publishedAt: input.publishedAt || null }
          : {}),
      },
    });
    return mapDbPost(updated);
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === 'P2025') {
      const nf: PostsRepositoryError = {
        code: 'NOT_FOUND',
        message: 'Post no encontrado',
      };
      throw nf;
    }
    if (isPrismaError(err) && err.code === 'P2002') {
      const c: PostsRepositoryError = {
        code: 'CONFLICT',
        message: 'Slug duplicado',
      };
      throw c;
    }
    throw {
      code: 'UNKNOWN',
      message: 'Error actualizando post',
    } satisfies PostsRepositoryError;
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({ where: { id } });
    return { ok: true } as const;
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === 'P2025') {
      const nf: PostsRepositoryError = {
        code: 'NOT_FOUND',
        message: 'Post no encontrado',
      };
      throw nf;
    }
    throw {
      code: 'UNKNOWN',
      message: 'Error eliminando post',
    } satisfies PostsRepositoryError;
  }
}
