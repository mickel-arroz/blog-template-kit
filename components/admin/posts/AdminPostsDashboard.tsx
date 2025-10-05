import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminPostsTable } from '@/components/admin/posts/data-table.client';
import { AdminPostsFilters } from '@/components/admin/posts/filters.client';
import { getAllPosts } from '@/services/admin/post/queries/getAllPosts';

export default async function AdminPostsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page ?? '1') || 1;
  const q = sp?.q ?? undefined;
  const status = sp?.status ?? undefined;
  const pageSize = 10;

  const { items, pagination } = await getAllPosts({
    page,
    pageSize,
    q,
    status,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/posts/new">Crear post</Link>
        </Button>
      </div>

      <AdminPostsFilters />

      <AdminPostsTable
        items={items}
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
      />
    </div>
  );
}
