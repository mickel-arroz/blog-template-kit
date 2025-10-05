// File: app/admin/posts/new/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NewPostForm } from '@/components/admin/posts/newPost/NewPostForm';

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Crear Post</h1>
        <NewPostForm />
      </section>
    </div>
  );
}
