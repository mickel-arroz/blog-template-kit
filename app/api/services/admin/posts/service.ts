import prisma from '@/app/api/lib/prisma/client';
import {
  PostSchema,
  type Post,
  AdminPostsQuerySchema,
  type PaginationMeta,
} from '@/domain/shared/schemas';
import type {
  Post as DbPost,
  Prisma,
  PostStatus as DbPostStatus,
} from '@prisma/client';

function mapDbPost(db: DbPost): Post {
  return PostSchema.parse({ ...db, status: db.status.toLowerCase() });
}

export async function listAdminPosts(rawQuery: unknown): Promise<{
  items: Post[];
  pagination: PaginationMeta;
}> {
  const { page, pageSize, q, status } = AdminPostsQuerySchema.parse(rawQuery);
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.PostWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status.toUpperCase() as DbPostStatus;

  const [total, rows] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
  ]);

  const items = rows.map(mapDbPost);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
