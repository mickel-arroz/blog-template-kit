'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from './data-table';
import { columns, type PostRow } from './columns';

export function AdminPostsTable({
  items,
  page,
  pageSize,
  total,
}: {
  items: PostRow[];
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <DataTable
      columns={columns}
      data={items}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={(p) => {
        const sp = new URLSearchParams(searchParams?.toString());
        sp.set('page', String(p));
        router.push(`/?${sp.toString()}`);
      }}
    />
  );
}
