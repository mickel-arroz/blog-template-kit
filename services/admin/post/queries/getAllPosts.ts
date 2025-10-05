import type { PostRow } from '@/components/admin/posts/columns';
import { axios } from '@/lib/http/axios';

export type GetAllPostsParams = {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
};

export type GetAllPostsResult = {
  items: PostRow[];
  pagination: { page: number; pageSize: number; total: number };
};

export async function getAllPosts({
  page,
  pageSize,
  q,
  status,
}: GetAllPostsParams): Promise<GetAllPostsResult> {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  if (q) qs.set('q', q);
  if (status) qs.set('status', status);

  const url = `/api/admin/posts?${qs.toString()}`;

  const { data } = await axios.get<GetAllPostsResult>(url);
  return data;
}
