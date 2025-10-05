'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type PostStatus } from '@/domain/shared/schemas';

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  tags: string[];
  excerpt?: string | null;
  createdAt?: string | null;
  publishedAt?: string | null;
};

export const columns: ColumnDef<PostRow>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <div
        className="font-medium truncate max-w-[320px]"
        title={row.original.title}
      >
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: 'excerpt',
    header: 'Resumen',
    cell: ({ row }) => (
      <div
        className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[420px]"
        title={String(row.original.excerpt ?? '')}
      >
        {row.original.excerpt ? String(row.original.excerpt) : '—'}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <span className="text-[10px] uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
        {row.original.tags?.length || 0}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado',
    cell: ({ row }) => (
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : '—'}
      </span>
    ),
  },
];
