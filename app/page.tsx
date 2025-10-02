// File: app/page.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { revalidatePath } from 'next/cache';
import { createPost, listPosts } from '@/services/posts/repository';
import { CreatePostSchema } from '@/domain/shared/schemas';

// Server Action para crear un Post de prueba usando el esquema compartido
async function create(formData: FormData) {
  'use server';
  const raw = {
    slug: String(formData.get('slug') || ''),
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || ''),
    excerpt: String(formData.get('excerpt') || ''),
    tags: (String(formData.get('tags') || '') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    status: (formData.get('status') || 'draft') as string,
  };

  const parsed = CreatePostSchema.safeParse(raw);
  if (!parsed.success) {
    // En un caso real devolverías errores serializables o usas formState
    console.error(parsed.error.flatten());
    return;
  }
  try {
    await createPost(parsed.data);
    revalidatePath('/');
  } catch (e) {
    console.error('Error creando post', e);
  }
}

export default async function Page() {
  // Lista inicial de posts (limit 10)
  const { items } = await listPosts({ limit: 10 });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Crear Post (demo)</h1>
        <form action={create} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              className="border rounded px-3 py-2 text-sm"
              placeholder="ej: mi-primer-post"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="title">
              Título
            </label>
            <input
              id="title"
              name="title"
              required
              className="border rounded px-3 py-2 text-sm"
              placeholder="Título del post"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="excerpt">
              Resumen
            </label>
            <input
              id="excerpt"
              name="excerpt"
              className="border rounded px-3 py-2 text-sm"
              placeholder="Opcional breve descripción"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="content">
              Contenido
            </label>
            <textarea
              id="content"
              name="content"
              required
              className="border rounded px-3 py-2 text-sm min-h-32"
              placeholder="Markdown o texto"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              className="border rounded px-3 py-2 text-sm"
              placeholder="nextjs,typescript"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="status">
              Estado
            </label>
            <select
              id="status"
              name="status"
              className="border rounded px-3 py-2 text-sm"
              defaultValue="draft"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-black text-white dark:bg-white dark:text-black text-sm px-4 py-2 rounded hover:opacity-90"
          >
            Crear
          </button>
        </form>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Posts recientes</h2>
        <ul className="space-y-3">
          {items.length === 0 && (
            <li className="text-sm text-neutral-500">No hay posts aún.</li>
          )}
          {items.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">{p.title}</h3>
                <span className="text-[10px] uppercase tracking-wide bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {p.excerpt || '—'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
