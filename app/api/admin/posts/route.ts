import { NextResponse, type NextRequest } from 'next/server';
import { listAdminPosts } from '@/app/api/services/admin/posts/service';
import {
  AdminPostsQuerySchema,
  CreatePostSchema,
} from '@/domain/shared/schemas';
import { createPost } from '@/app/api/services/posts/repository';

// Evitar cache para panel admin
export const dynamic = 'force-dynamic';

const QuerySchema = AdminPostsQuerySchema;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Parámetros de consulta inválidos',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = await listAdminPosts(parsed.data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/admin/posts error', err);
    return NextResponse.json(
      { error: 'Error obteniendo posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const created = await createPost(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/admin/posts error', err);
    // Error code mapping best-effort
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as Record<string, unknown>).code
        : undefined;
    if (code === 'CONFLICT') {
      return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error creando post' }, { status: 500 });
  }
}
