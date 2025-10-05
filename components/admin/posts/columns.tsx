'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type PostStatus } from '@/domain/shared/schemas';
import EditIcon from '@/components/icons/EditIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { axios } from '@/lib/http/axios';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

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

function ActionsCell({ id, status }: { id: string; status: PostStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const disabled = status === 'deleted';

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await axios.delete(`/api/admin/posts/${id}`);
        router.refresh();
      } catch (e) {
        console.error('Error eliminando post', e);
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      {disabled ? (
        <Button variant="ghost" size="icon-sm" aria-label="Editar" disabled>
          <EditIcon />
        </Button>
      ) : (
        <Button asChild variant="ghost" size="icon-sm" aria-label="Editar">
          <Link href={`/admin/posts/${id}`}>
            <EditIcon />
          </Link>
        </Button>
      )}

      <ConfirmationModal
        onConfirm={confirmDelete}
        title="Eliminar post"
        description={`¿Seguro que deseas eliminar este post? Podrás verlo en el listado como "DELETED" y no se podrá editar ni eliminar nuevamente.`}
        confirmText={isPending ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        disabled={disabled || isPending}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Eliminar"
            disabled={disabled || isPending}
          >
            <TrashIcon />
          </Button>
        }
      />
    </div>
  );
}

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
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionsCell id={row.original.id} status={row.original.status} />
    ),
  },
];
