import { notFound } from 'next/navigation';
import { getPostById } from '@/app/api/services/posts/repository';
import { PostForm } from '@/components/admin/posts/PostForm';

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return notFound();

  const initialValues = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    content: post.content,
    coverImage: post.coverImage ?? null,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
  } as const;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar post</h1>
      <PostForm edit initialValues={initialValues} />
    </div>
  );
}
