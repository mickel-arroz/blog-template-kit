export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import AdminPostsDashboard from '@/components/admin/posts/AdminPostsDashboard';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  return <AdminPostsDashboard searchParams={searchParams} />;
}
